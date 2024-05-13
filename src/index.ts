import express, { type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(express.json())

const opensky = 'https://opensky-network.org/api/flights'

// const testStrings = [
//   'http://localhost:3000/aircraft?type=arrival&airport=EDDF&begin=1517227200&end=1517230800',
//   'http://localhost:3000/aircraft?type=departure&airport=EDDF&begin=1517227200&end=1517230800',
// ]

type OpenSkyResponse = {
  icao24: string
  firstSeen: number
  estDepartureAirport: string | null
  lastSeen: number
  estArrivalAirport: string
  callsign: string
  estDepartureAirportHorizDistance: number | null
  estDepartureAirportVertDistance: number | null
  estArrivalAirportHorizDistance: number
  estArrivalAirportVertDistance: number
  departureAirportCandidatesCount: number
  arrivalAirportCandidatesCount: number
}

app.get('/aircraft', async (req: Request, res: Response) => {
  try {
    const cachedRequest = await prisma.request.findFirst({
      where: {
        type: req.query.type as 'arrival' | 'departure',
        airport: req.query.airport as string,
        begin: Number.parseInt(req.query.begin as string),
        end: Number.parseInt(req.query.end as string),
      },
      include: {
        aircraft: {
          select: {
            icao24: true,
            estDepartureAirport: true,
            estArrivalAirport: true,
            callsign: true,
            firstSeen: true,
            lastSeen: true,
          },
        },
      },
    })

    if (cachedRequest) {
      return res.status(200).json(cachedRequest.aircraft)
    }

    const aircraft = await fetch(
      `${opensky}/${req.query.type}?airport=${req.query.airport}&begin=${req.query.begin}&end=${req.query.end}`
    )

    const aircraftPayload: OpenSkyResponse[] = await aircraft.json()

    const aircraftPayloadNormalised = aircraftPayload.map((aircraft) => ({
      icao24: aircraft.icao24,
      estDepartureAirport: aircraft.estDepartureAirport,
      estArrivalAirport: aircraft.estArrivalAirport,
      callsign: aircraft.callsign,
      firstSeen: aircraft.firstSeen,
      lastSeen: aircraft.lastSeen,
    }))

    await prisma.request.create({
      data: {
        type: req.query.type as string,
        airport: req.query.airport as string,
        begin: Number.parseInt(req.query.begin as string),
        end: Number.parseInt(req.query.end as string),
        aircraft: {
          createMany: {
            data: aircraftPayloadNormalised,
          },
        },
      },
    })

    return res.status(200).json(aircraftPayloadNormalised)
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

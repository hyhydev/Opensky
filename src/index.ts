import express, { type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { fetchAircraft } from './opensky'
import { canParseToInt, isAllString } from './helpers'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(express.json())

// const testStrings = [
//   'http://localhost:3000/aircraft?type=arrival&airport=EDDF&begin=1517227200&end=1517230800',
//   'http://localhost:3000/aircraft?type=departure&airport=EDDF&begin=1517227200&end=1517230800',
// ]

/*
 * @swagger
 * tags:
 *   name: Aircraft
 *   description: An API for getting aircraft data
 * /aircraft:
 *   get:
 *     summary: Get a list of aircraft
 *     tags: [Aircraft]
 *     parameters:
 *      - in: path
 *        name: type
 *        schema:
 *          type: string
 *        required: true
 *        description: Arrivals or departures
 *      - in: path
 *        name: airport
 *        schema:
 *          type: string
 *        required: true
 *        description: The code for the airport to filter by
 *      - in: path
 *        name: begin
 *        schema:
 *          type: string
 *        required: true
 *        description: The start datetime to filter by
 *      - in: path
 *        name: end
 *        schema:
 *          type: string
 *        required: true
 *        description: The end datetime to filter by
 *     responses:
 *       200:
 *         description: The list of aircraft
 *       400:
 *         description: The request was invalid
 *       500:
 *         description: Server error
 */
app.get('/aircraft', async (req: Request, res: Response) => {
  try {
    const { type, airport, begin, end } = req.query

    if (
      !isAllString([type, airport, begin, end]) ||
      !['arrivals', 'departures'].includes(airport as string) ||
      !canParseToInt(begin as string) ||
      !canParseToInt(end as string)
    ) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const cachedRequest = await prisma.request.findFirst({
      where: {
        type: type as 'arrival' | 'departure',
        airport: airport as string,
        begin: Number.parseInt(begin as string),
        end: Number.parseInt(end as string),
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

    const aircraftPayloadNormalised = await fetchAircraft({
      type: type as string,
      airport: airport as string,
      begin: begin as string,
      end: end as string,
    })

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

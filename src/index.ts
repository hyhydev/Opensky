import express, { type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(express.json())

const opensky = 'https://opensky-network.org/api/flights'

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

// Get all items
app.get('/aircraft', async (req: Request, res: Response) => {
  try {
    console.log(req.query)

    const cachedRequest = await prisma.request.findFirst({
      where: {
        type: req.query.type as string,
        airport: req.query.airport as string,
        begin: Number.parseInt(req.query.begin as string),
        end: Number.parseInt(req.query.end as string),
      },
      include: {
        aircraft: true,
      },
    })

    if (cachedRequest) {
      res.status(200).json(cachedRequest.aircraft)
      return
    }

    const aircraft = await fetch(
      `${opensky}/${req.query.type}?airport=${req.query.airport}&begin=${req.query.begin}&end=${req.query.end}`
    )

    const aircraftPayload: OpenSkyResponse[] = await aircraft.json()

    await prisma.request.create({
      data: {
        type: req.query.type as string,
        airport: req.query.airport as string,
        begin: Number.parseInt(req.query.begin as string),
        end: Number.parseInt(req.query.end as string),
        aircraft: {
          createMany: {
            data: aircraftPayload.map((aircraft) => ({
              icao24: aircraft.icao24,
              estDepartureAirport: aircraft.estDepartureAirport,
              estArrivalAirport: aircraft.estArrivalAirport,
              callsign: aircraft.callsign,
              firstSeen: aircraft.firstSeen,
              lastSeen: aircraft.lastSeen,
            })),
          },
        },
      },
    })

    res.status(200).json(aircraft)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// // Create a new item
// app.post("/items", async (req: Request, res: Response) => {
//     const { name, description } = req.body;
//     try {
//         const newItem = await prisma.item.create({
//             data: {
//                 name,
//                 description,
//             },
//         });
//         res.status(201).json(newItem);
//     } catch (error) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // Get a single item
// app.get("/items/:id", async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id!);
//     try {
//         const item = await prisma.item.findUnique({
//             where: {
//                 id,
//             },
//         });
//         if (!item) {
//             res.status(404).json({ error: "Item not found" });
//         } else {
//             res.json(item);
//         }
//     } catch (error) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // Delete an item
// app.delete("/items/:id", async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id!);
//     try {
//         await prisma.item.delete({
//             where: {
//                 id,
//             },
//         });
//         res.sendStatus(204);
//     } catch (error) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // Update an item
// app.put("/items/:id", async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id!);
//     const { name, description } = req.body;
//     try {
//         const updatedItem = await prisma.item.update({
//             where: {
//                 id,
//             },
//             data: {
//                 name,
//                 description,
//             },
//         });
//         res.json(updatedItem);
//     } catch (error) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

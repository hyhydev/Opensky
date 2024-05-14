import express, { type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { fetchAircraft } from '../opensky'
import { canParseToInt, isAllString } from '../helpers'

const router = express.Router()
const prisma = new PrismaClient()

/*
 * @swagger
 * components:
 *   schemas:
 *     Aircraft
 *       type: object
 *         required:
 *           - icao24
 *           - estDepartureAirport
 *           - estArrivalAirport
 *           - callSign
 *           - firstSeen
 *           - lastSeen
 *         properties:
 *           id:
 *             type: string
 *             description: The auto-generated cuid of the Aircraft
 *           createdAt:
 *             type: string
 *             description: The timestamp the database entry was created
 *           updatedAt:
 *             type: string
 *             description: The timestamp the database entry was last updated
 *           icao24:
 *             type: string
 *             description: The ICAO address of the Aircraft
 *           estDepartureAirport:
 *             type: string
 *             description: The code of the departure airport
 *           estArrivalAirport:
 *             type: string
 *             description: The code of the arrival airport
 *           callSign:
 *             type: string
 *             description: The callsign of the Aircraft
 *           firstSeen:
 *             type: int
 *             description: When the Aircraft was first seen
 *           lastSeen:
 *             type: int
 *             description: When the Aircraft was last seen
 *         example:
 *           id: clw57e2110002tbt6d7hq5nfu
 *           createdAt: 2024-05-13T16:53:44.774Z
 *           updatedAt: 2024-05-13T16:53:44.774Z
 *           icao24: 3c6675
 *           estDepartureAirport: EDDT
 *           estArrivalAirport: EDDF
 *           callSign: DLH187
 *           firstSeen: 1517227831
 *           lastSeen: 1517230709
 *
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aircraft'
 *       400:
 *         description: The request was invalid
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, airport, begin, end } = req.query

    if (
      !isAllString([type, airport, begin, end]) ||
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

export default router

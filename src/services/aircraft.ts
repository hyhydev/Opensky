import { PrismaClient } from '@prisma/client'
import { canParseToInt, isAllString } from '../helpers'
import { fetchAircraft } from '../opensky'

const prisma = new PrismaClient()

type AircraftServiceResponse = {
  icao24: string
  estDepartureAirport: string | null
  estArrivalAirport: string | null
  callsign: string
  firstSeen: number
  lastSeen: number
}[]

class AircraftService {
  validateInputs(type: any, airport: any, begin: any, end: any): boolean {
    if (
      !isAllString([type, airport, begin, end]) ||
      !canParseToInt(begin as string) ||
      !canParseToInt(end as string)
    ) {
      return false
    }
    return true
  }

  async processRequest(
    type: string,
    airport: string,
    begin: string,
    end: string
  ): Promise<{ success: boolean; data?: AircraftServiceResponse }> {
    // try {
    const cachedRequest = await prisma.request.findFirst({
      where: {
        type,
        airport,
        begin: Number.parseInt(begin),
        end: Number.parseInt(end),
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
      return { success: true, data: cachedRequest.aircraft }
    }

    const aircraftPayloadNormalised = await fetchAircraft({
      type: type,
      airport: airport,
      begin: begin,
      end: end,
    })

    await prisma.request.create({
      data: {
        type: type,
        airport: airport,
        begin: Number.parseInt(begin),
        end: Number.parseInt(end),
        aircraft: {
          createMany: {
            data: aircraftPayloadNormalised,
          },
        },
      },
    })

    return { success: true, data: aircraftPayloadNormalised }
    // } catch (error) {
    //   throw new Error('Processing failed')
    // }
  }
}

export default new AircraftService()

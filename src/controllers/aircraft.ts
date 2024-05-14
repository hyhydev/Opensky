import { Request, Response } from 'express'
import aircraftService from '../services/aircraft'

class AircraftController {
  async getAircraft(req: Request, res: Response): Promise<Response> {
    const { type, airport, begin, end } = req.query

    if (!aircraftService.validateInputs(type, airport, begin, end)) {
      return res.status(400).json({ error: 'Bad request' })
    }

    try {
      const result = aircraftService.processRequest(
        type as string,
        airport as string,
        begin as string,
        end as string
      )
      return res.status(200).json((await result).data)
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export default new AircraftController()

import { Request, Response } from 'express'
import AircraftController from '../../controllers/aircraft'
import AircraftService from '../../services/aircraft'

jest.mock('../../services/aircraft')

describe('AircraftController', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    req = {
      query: {
        type: 'type1',
        airport: 'airport1',
        begin: '20230101',
        end: '20230102',
      },
    }
    jsonMock = jest.fn()
    statusMock = jest.fn(() => ({ json: jsonMock })) as unknown as jest.Mock
    res = {
      status: statusMock,
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if inputs are invalid', async () => {
    ;(AircraftService.validateInputs as jest.Mock).mockReturnValue(false)

    await AircraftController.getAircraft(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Bad request' })
  })

  it('should return 200 and process data if inputs are valid', async () => {
    ;(AircraftService.validateInputs as jest.Mock).mockReturnValue(true)
    ;(AircraftService.processRequest as jest.Mock).mockReturnValue({
      success: true,
      data: {
        type: 'type1',
        airport: 'airport1',
        begin: '20230101',
        end: '20230102',
      },
    })

    await AircraftController.getAircraft(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      type: 'type1',
      airport: 'airport1',
      begin: '20230101',
      end: '20230102',
    })
  })

  it('should return 500 if processing fails', async () => {
    ;(AircraftService.validateInputs as jest.Mock).mockReturnValue(true)
    ;(AircraftService.processRequest as jest.Mock).mockImplementation(() => {
      throw new Error('Internal Server Error')
    })

    await AircraftController.getAircraft(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' })
  })
})

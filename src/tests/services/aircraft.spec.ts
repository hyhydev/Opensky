import AircraftService from '../../services/aircraft'

describe('AircraftService', () => {
  it('should successfully validate valid inputs', () => {
    const isValid = AircraftService.validateInputs(
      'type1',
      'airport1',
      '20230101',
      '20230102'
    )
    expect(isValid).toBe(true)
  })

  it('should invalidate inputs if the second parameter is not a string', () => {
    const isValid = AircraftService.validateInputs(
      'type1',
      null,
      '20230101',
      '20230102'
    )
    expect(isValid).toBe(false)
  })

  it('should invalidate inputs if the third parameter is not a string', () => {
    const isValid = AircraftService.validateInputs(
      'type1',
      'airport1',
      null,
      '20230102'
    )
    expect(isValid).toBe(false)
  })

  it('should invalidate inputs if the fourth parameter is not a string', () => {
    const isValid = AircraftService.validateInputs(
      'type1',
      'airport1',
      '20230101',
      null
    )
    expect(isValid).toBe(false)
  })

  it('should invalidate inputs if the first parameter is not a string', () => {
    const isValid = AircraftService.validateInputs(
      null,
      'airport1',
      '20230101',
      '20230102'
    )
    expect(isValid).toBe(false)
  })

  // it('should process aircraft data successfully', () => {
  //   const result = AircraftService.processRequest(
  //     'type1',
  //     'airport1',
  //     '20230101',
  //     '20230102'
  //   )
  //   expect(result).toEqual({
  //     success: true,
  //     data: {
  //       type: 'type1',
  //       airport: 'airport1',
  //       begin: '20230101',
  //       end: '20230102',
  //     },
  //   })
  // })
})

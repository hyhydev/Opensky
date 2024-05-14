/**
 * @jest-environment node
 */

import axios from 'axios'

describe('GET /aircraft', () => {
  it('should return 200 for valid inputs', async () => {
    const response = await axios.get(
      'http://localhost:3000/aircraft?type=arrival&airport=EDDF&begin=1517227200&end=1517230800'
    )
    expect(response.status).toBe(200)
  })
})

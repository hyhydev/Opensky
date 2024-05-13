type IFetchAircraft = {
  type: string
  airport: string
  begin: string
  end: string
}

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

export const fetchAircraft = async ({
  type,
  airport,
  begin,
  end,
}: IFetchAircraft) => {
  const aircraft = await fetch(
    `https://opensky-network.org/api/flights/${type}?airport=${airport}&begin=${begin}&end=${end}`
  )

  const aircraftPayload: OpenSkyResponse[] = await aircraft.json()

  return aircraftPayload.map((aircraft) => ({
    icao24: aircraft.icao24,
    estDepartureAirport: aircraft.estDepartureAirport,
    estArrivalAirport: aircraft.estArrivalAirport,
    callsign: aircraft.callsign,
    firstSeen: aircraft.firstSeen,
    lastSeen: aircraft.lastSeen,
  }))
}

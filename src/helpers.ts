export const isAllString = (data: any[]) => {
  return data.every((value) => typeof value === 'string')
}

export const canParseToInt = (str: string) => {
  return !isNaN(parseInt(str))
}

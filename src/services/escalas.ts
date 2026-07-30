import pb from '@/lib/pocketbase/client'

export const TURNO_OPTIONS = [
  '06H15 ÁS 15H15',
  '08H00 ÁS 17H00',
  '09H00 ÁS 18H00',
  '10H00 ÁS 19H00',
  '11H00 ÁS 20H00',
  '13H00 ÁS 22H00',
  '15H00 ÁS 23H43',
  '23H30 ÁS 06H30',
]

export const PROJETO_ESCALA_OPTIONS = ['NOC', 'COPE', 'BKO', 'OHR', 'Radisys']

export const getEscalas = async (page = 1, perPage = 10) => {
  return pb.collection('escalas').getList(page, perPage, {
    sort: '-Data',
    expand: 'Usuario_ID',
  })
}

export const createEscala = (data: {
  Data: string
  Usuario_ID: string
  Projeto: string
  Turno: string
}) =>
  pb.collection('escalas').create({
    ...data,
    Status: 'Agendado',
  })

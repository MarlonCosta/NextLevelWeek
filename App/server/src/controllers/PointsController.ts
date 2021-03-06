import {Request, Response} from 'express'
import knex from '../database/connection'

class PointsController{
   async index(request: Request, response: Response)  {

      const { city, uf, items } = request.query

      const searchCriteria = request.query
      
      const parsedItems = items ? String(items)
         .split(',')
         .map(item => Number(item.trim())) : []

      const points = await knex('points')
         .join('point_items', 'points.id', '=', 'point_items.point_id')
         .where((qb) => {
            if(city){
               qb.where('city', String(city))
            }

            if (uf){
               qb.where('uf', String(uf))
            }

            if (parsedItems.length != 0){
               qb.whereIn('point_items.item_id', parsedItems)
            }
         })
         .distinct()
         .select('points.*')

      
      return response.json(points)

   }

   async show(request: Request, response: Response)  {
      const { id } = request.params

      const point = await knex('points').where('id', id).first()

      const items = await knex('items')
         .join('point_items', 'items.id', '=', "point_items.item_id")
         .where('point_items.point_id', id)
         .select('items.title')

      if(!point) {
         return response.status(400).json({message: 'Point not found'})
      }
      else{
         return response.json({ point, items })
      }

   }

   async create(request: Request, response: Response)  {
      const {
         name,
         email,
         whatsapp,
         latitude, 
         longitude,
         city,
         uf,
         items
      } = request.body
     
      const trx = await knex.transaction()

      const point = { 
         image: 'place_holder',
         name,
         email,
         whatsapp,
         latitude, 
         longitude,
         city,
         uf
      }
     
      const insertedId = await trx('points').insert(point)
   
      const point_id = insertedId[0]
   
      const pointItems = items.map((item_id: number) => {
         return {
            item_id,
            point_id
         }
      })
   
      await trx('point_items').insert(pointItems)

      await trx.commit()

      return response.json({id: point_id, ...point})
   }
}

export default PointsController
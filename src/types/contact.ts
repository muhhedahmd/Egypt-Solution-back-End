
export type FilterType = 
  | "email" 
  | "name" 
  | "phone" 
  | "company" 
  | "subject" 
  | "message"
  | "category" 
  | "status" 
  | "priority"
  | "budget"
  | "timeline"
  | "dateRange"

  export interface FilterParams {
  type: FilterType
  email?: string
  name?: string
  phone?: string
  company?: string
  subject?: string
  message?: string
  category?: string
  status?: string
  priority?: string
  budget?: string
  timeline?: string
  startDate?: Date | string
  endDate?: Date | string
  skip: number
  take: number
}
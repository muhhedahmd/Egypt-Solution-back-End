import { websiteAnalyticsValidator } from "../../validtation/websiteAnalytics.schema"
import { WebsiteAnalyticsRepository } from "./websiteAnalytics.repostory"



export class websiteAnalyticsLogic  {
    constructor (
        private validator : websiteAnalyticsValidator ,
        private repository : WebsiteAnalyticsRepository
        
    ){ 
        
    }

}
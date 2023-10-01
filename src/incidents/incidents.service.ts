import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentEntityService } from 'src/database/entities/incident/incidentEntity.service';
import { ContactEntityService } from 'src/database/entities/contacts/contactsEntity.service';
import { SNSService } from 'src/SNS/SNS.service';



@Injectable()
export class IncidentsService {
  constructor( 
    private readonly incidentEntityService: IncidentEntityService,
    private readonly contactsEntityService: ContactEntityService,
    private readonly snsService: SNSService
  ) {}
  async sendAlertContacts(incidentId: string, userId: number, userName: string, contacts: Array<any>) {
    let res = {}
    if(!incidentId || contacts.length === 0) throw new NotFoundException();
    else{
      contacts.forEach(element => {
        let url = 'https://api.safetyguard.com.mx/follow-up/' + incidentId + '/' + element.external_id
        const message = 'Tu contacto ' + userName + ' ha presionado el botón de panico, revisa el incidente: ' + url
        res = {...this.snsService.sendNotificationContacts(element.sms_topic, message)}
      });
      res = {status: 'success', message: 'Notification sent'}
      return res
    }
  }

  async getIncident (id: string, external_id: string) {
    const incident = await this.incidentEntityService.findincident(id);
    const contact = await this.contactsEntityService.FindcontactByExternalId(external_id);
    if (!incident || !contact) throw new NotFoundException();
    const response = {...incident}
    return response;
    
  }
}

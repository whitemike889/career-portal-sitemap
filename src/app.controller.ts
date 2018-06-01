import { Get, Controller, Response, Param, Render } from '@nestjs/common';
import { AppService } from './app.service';
import axios, { AxiosResponse } from 'axios';
import * as sitemap from 'sitemap';

const intlData = {
  locales: 'en-US',
};

const publicRestEndpoint: string = process.env.BULLHORN_PUBLIC_ENDPOINT;
const hostedEndpoint: string = process.env.HOSTED_ENDPOINT;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('config')
  async root(): Promise<any> {
    // return this.appService.root();
    return {};
  }

  @Get('sitemap.xml')
  async sitemap(@Response() response): Promise<string> {
    response.header('Content-Type', 'application/xml');

    const map = sitemap.createSitemap({
      hostname: hostedEndpoint,
      cacheTime: 600000,  // 600 sec cache period
    });
    return axios.get(`${publicRestEndpoint}/search/JobOrder?fields=id,title,dateLastPublished&query=isDeleted:0&sort=-dateLastPublished&count=20`)
      .then((res: AxiosResponse) => res.data)
      .then((results: any) => {
        for ( const job of results.data) {
          map.add({url: `/jobs/${job.id}`, lastmodISO: (new Date(job.dateLastPublished || Date.now())).toISOString()});
        }
        response.send(map.toString());
        return map.toString();
      }).catch((err) => {
        response.send(err.message);
        return err.message;
      });
  }

  @Get('jobs/:id')
  @Render('job')
  async job( @Response() response, @Param('id') id: number ) {
    return axios.get(`${publicRestEndpoint}/search/JobOrder?fields=*&query=id:${id}`)
      .then((res: AxiosResponse) => res.data)
      .then((result: any) => {
        const job = result.data[0];
        return { job: Object.assign({}, job, { startDate: new Date(job.startDate) }), intl: intlData };
      }).catch((err) => {
        console.error(err.message);
        return err.message;
      });
  }
}

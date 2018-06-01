import { Get, Controller, Response, Param, Render } from '@nestjs/common';
import { AppService } from './app.service';
import * as sitemap from 'sitemap';

const intlData = {
  locales: 'en-US',
};

const publicRestEndpoint: string = process.env.BULLHORN_PUBLIC_ENDPOINT;
const hostedEndpoint: string = process.env.HOSTED_ENDPOINT;
const companyName: string = process.env.COMPANY_NAME;
const companyLogo: string = process.env.COMPANY_LOGO_URL;
const companyWebsite: string = process.env.COMPANY_WEBSITE;
const googleVerificationCode: string = process.env.GOOGLE_VERIFICATION_CODE;

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get()
  @Render('list')
  async root(): Promise<any> {
    // return this.appService.root();
    const jobs = await this.service.getJobs();
    return {
      jobs: jobs.data,
      companyName,
      companyLogo,
      companyWebsite,
      googleVerificationCode,
    };
  }

  @Get('sitemap.xml')
  async sitemap(@Response() response): Promise<string> {
    response.header('Content-Type', 'application/xml');

    const map = sitemap.createSitemap({
      hostname: hostedEndpoint,
      cacheTime: 600000,  // 600 sec cache period
    });
    return this.service.getJobs().then((results) => {
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
    const job: any = await this.service.getJob(id);
    const published = new Date(job.dateLastPublished);
    let employmentType: string = job.employmentType;
    switch (employmentType.toLowerCase().replace(/\s-_/gi, '')) {
      case 'fulltime':
        employmentType = 'FULL_TIME';
        break;
      case 'parttime':
        employmentType = 'PART_TIME';
        break;
      case 'contract':
      case 'contractor':
        employmentType = 'CONTRACTOR';
        break;
      case 'temp':
      case 'temporary':
        employmentType = 'TEMPORARY';
        break;
      default:
        employmentType = 'OTHER';
        break;
    }
    return {
      job: Object.assign({}, job, {
        startDate: new Date(job.startDate),
        dateLastPublished: published.toISOString(),
        validThrough: new Date(published.setDate(published.getDate() + 7)).toISOString(),
      }),
      companyName,
      companyLogo,
      companyWebsite,
      intl: intlData,
    };
  }
}

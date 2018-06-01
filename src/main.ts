import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as hbs from 'hbs';
import * as helpers from 'handlebars-intl';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useStaticAssets(__dirname + '/public');
  app.setBaseViewsDir(__dirname + '/views');
  app.setViewEngine('hbs');
  
  helpers.registerWith(hbs);

  await app.listen(3000);
}

bootstrap();

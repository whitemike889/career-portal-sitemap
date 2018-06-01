import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as hbs from 'hbs';
import * as helpers from 'hbs-helpers';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useStaticAssets(__dirname + '/public');
  app.setBaseViewsDir(__dirname + '/views');
  app.setViewEngine('hbs');

  Object.keys(helpers).forEach((key) => {
    hbs.registerHelper(key, helpers[key]);
  });

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./routes/*'];

const doc = {
    info: {
      title: 'My API',
      description: 'Description',
    },
    host: 'localhost:5000',
    schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, doc);
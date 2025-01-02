const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./routes/authRoutes.js'];

const doc = {
    info: {
      title: 'My API',
      description: 'Description',
    },
    host: 'localhost:5001',
    schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, doc);
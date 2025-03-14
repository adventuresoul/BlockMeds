# BlockMeds API

BlockMeds is a Web3-based application designed to manage smart prescriptions securely using blockchain technology. It ensures prescription authenticity, prevents abuse, and maintains transparency among doctors, pharmacists, patients, and regulatory bodies.

## Architecture

BlockMeds follows a **microservices architecture**, with each service running in a **Docker container**. The primary services are:

- **Auth Service**: Manages user authentication and registration.
- **Contract Service**: Interacts with blockchain smart contracts for prescription handling.
- **Gateway Service**: Acts as an API gateway for routing requests.
- **Analytics Service**: Provides insights and monitoring for prescription data.

## Technologies Used

- **Backend**: Node.js, FastAPI
- **Database**: MongoDB (with encrypted storage)
- **Blockchain**: Ethereum, Web3.js
- **Authentication**: JWT-based authentication
- **Containerization**: Docker
- **API Documentation**: Swagger (OpenAPI 3.0)

## Microservices Breakdown

### 1. Auth Service
Handles authentication and registration for different user roles:
- **Patients**
- **Doctors**
- **Pharmacists**
- **Regulatory Body**

### 2. Contract Service
Manages prescription-related operations on the blockchain, including:
- **Creating prescriptions**
- **Fetching prescriptions by ID**
- **Tracking transaction details**
- **Setting and retrieving drug limits**
- **Flagging prescriptions for review**

### 3. Gateway Service
- Routes API requests to respective microservices.
- Implements access control and request validation.

### 4. Analytics Service
- Provides prescription trend analysis.
- Detects potential misuse or fraud patterns.

## Deployment

### Docker Setup
Each service runs in its own Docker container. Use the following commands to start the services:
```sh
# Build and start all services
docker-compose up 
```

To stop the services:
```sh
docker-compose down
```

## Security Measures
- **Encrypted Storage in MongoDB**: Ensures prescription data remains private.
- **Role-Based Access Control**: Prevents unauthorized access to prescription data.
- **Blockchain Integrity**: Ensures data immutability and transparency.

## Future Enhancements
- Dynamic dosage calculations
- Advanced **AI-powered analytics** for fraud detection.
- Mobile application support.

---

**BlockMeds** revolutionizes prescription management by leveraging blockchain security and transparency. 🚀


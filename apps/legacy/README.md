# Legacy Apps

It's the demo app for showing a legacy environment.
The application manages directly the database password and linux users and uses too simple credentials.
For production it should use AWS Secrets Manager or any other credential stores to manage the application credentials.

## Development

./gradlew run

### Datasource
Copy `app/sample/tomcat-context.xml` to `app/webapp-config` directory

### Logging
Copy `app/sample/logging.properties` to `app/webapp-config` directory

# DOCRDR - Sample Application for "Re-Architecting for Containerized Modern Application Workshop"

It's the sample application to demonstrate how to modernize legacy applications.

The sample uses:

* Java
* Jakarta Servlet
* Tomcat

## Inspect the legacy app

Check the legacy app and run it:

```bash
cd apps/legacy
./gradlew run
```

You can access the sample app:
http://localhost:8080

Stop the app by `Ctrl + C`.

## Inspect the modern app

Check the modern app and run it:

```bash
cd apps/modern-app-sample
docker compose up --build
```

What should we do to modernize our app?

See also [the workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/a49e50ba-7473-4348-ba5d-6166385ad91d)

## Notes

The application has no authentication and publishes the loadbalancer port to the world. For production workload you need to consider the way to limit the scope.

# Stage 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the built jar in a lightweight image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# Memory flags for small hosts (Render free tier = 512 MB):
#  - use up to 70% of the container's RAM for the heap instead of the default 25%
#  - the serial GC uses less memory than the default one on small containers
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-XX:+UseSerialGC", "-jar", "app.jar"]
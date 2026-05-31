# ---------- Etapa 1: build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache de dependências: copia só o pom primeiro
COPY pom.xml .
RUN mvn -q -B dependency:go-offline || true

# Copia o código e gera o JAR
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---------- Etapa 2: runtime ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# O Render injeta a variável PORT; a aplicação já a lê em application.yml
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

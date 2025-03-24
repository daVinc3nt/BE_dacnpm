# Choose ubuntu version
FROM mcr.microsoft.com/mssql/server:2019-latest

# Chạy với quyền root để tránh lỗi permission
USER root

# Cài đặt các công cụ cần thiết
RUN apt-get update && apt-get install -y unzip curl && \
    curl -L https://aka.ms/sqlpackage-linux -o sqlpackage.zip && \
    unzip sqlpackage.zip -d /opt/sqlpackage && \
    chmod +x /opt/sqlpackage/sqlpackage && \
    rm sqlpackage.zip

# Create app directory
WORKDIR /usr/src/app
# Copy initialization scripts
COPY . /usr/src/app
RUN chmod +x /usr/src/app/run-initialization.sh
# Set environment variables, not have to write them with the docker run command
# Note: make sure that your password matches what is in the run-initialization script 
ENV SA_PASSWORD YourStrong!Passw0rd
ENV ACCEPT_EULA Y
ENV MSSQL_PID Developer

# Expose port 1433 in case accessing from other container
# Expose port externally from docker-compose.yml
EXPOSE 1433

# Run Microsoft SQL Server and initialization script (at the same time)
CMD /bin/bash ./entrypoint.sh
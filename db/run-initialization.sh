# Wait to be sure that SQL Server came up
echo "SQL Server đang khởi động, đợi 60 giây..."
for i in {60..1}; do
    echo -ne "$i giây còn lại...\r"
    sleep 1
done
echo "SQL Server đã sẵn sàng!"

# Run the setup script to create the DB and the schema in the DB
echo "Đang tạo database và schema..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P YourStrong!Passw0rd -d master -i init-db.sql -C

# Kiểm tra xem database đã được tạo chưa
echo "Đang kiểm tra database..."
DB_CHECK=$(/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P YourStrong!Passw0rd -Q "SELECT name FROM sys.databases WHERE name = 'dacnpm'" -h -1 -W -C)

if [ -z "$DB_CHECK" ]; then
    echo "❌ Lỗi: Database 'dacnpm' chưa được tạo!"
    exit 1
else
    echo "✅ Database 'dacnpm' đã được tạo thành công!"
fi

# chmod 777 /var/opt/mssql/data/db.bacpac  # Đảm bảo có quyền đọc

# Import .bacpac file into the newly created database
# echo "📦 Import db.bacpac vào dacnpm..."
# /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -Q "DROP DATABASE IF EXISTS dacnpm"
# /opt/sqlpackage/sqlpackage /Action:Import \
#     /SourceFile:/usr/src/app/db.bacpac \
#     /TargetServerName:localhost \
#     /TargetDatabaseName:dacnpm \
#     /TargetUser:SA \
#     /TargetPassword:"YourStrong!Passw0rd" \
#     /TargetEncryptConnection:false

# # Kiểm tra xem import có thành công không
# IMPORT_CHECK=$(/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P YourStrong!Passw0rd -d dacnpm -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES" -h -1 -W -C)

# if [ "$IMPORT_CHECK" -gt 0 ]; then
#     echo "✅ Import database thành công!"
# else
#     echo "❌ Lỗi: Import database thất bại!"
#     exit 1
# fi

DATA_DIR := C:/Users/Eddie/Desktop/coding/LongNightOfSolace/lib
COUNTRIES_URL := https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_0_countries.zip
SHAPEFILE := $(DATA_DIR)/ne_10m_admin_0_countries.shp
GEOJSON := $(DATA_DIR)/countries.geojson

all: data convert

data:
	@if not exist $(DATA_DIR) mkdir $(DATA_DIR)
	curl -o $(DATA_DIR)/countries.zip $(COUNTRIES_URL)
	powershell -Command "Expand-Archive -Path '$(DATA_DIR)/countries.zip' -DestinationPath '$(DATA_DIR)' -Force"

convert:
	ogr2ogr -f GeoJSON \
		$(GEOJSON) $(SHAPEFILE) \
		-select admin,iso_a2,iso_a3 \
		-lco COORDINATE_PRECISION=6 \
		-makevalid
clean:
	@if exist $(DATA_DIR)/countries.zip del /q $(DATA_DIR)/countries.zip
	@if exist $(DATA_DIR)/*.shp del /q $(DATA_DIR)/*.shp
	@if exist $(DATA_DIR)/*.dbf del /q $(DATA_DIR)/*.dbf
	@if exist $(DATA_DIR)/*.prj del /q $(DATA_DIR)/*.prj
	@if exist $(DATA_DIR)/*.shx del /q $(DATA_DIR)/*.shx
	@if exist $(DATA_DIR)/*.cpg del /q $(DATA_DIR)/*.cpg
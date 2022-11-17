import json
import csv

with open("dataset2.json", 'r') as f:
    data = json.load(f)

with open("forest-area-as-share-of-land-area.csv",'r') as f2:
	csvreader=csv.reader(f2)
	header=next(csvreader)
	rows=[]
	for row in csvreader:
		rows.append(row)


# for each country
for country in data['features']:	
	country_code = country['properties']['GU_A3']
	found=0

	# for each row in the csv
	for row in rows:

		# if the country code matches
		if country_code == row[1]:

			# create a new json entry called FORESTyyyy: row[3] i.e. forst cover value
			keystring="FOREST"+row[2]
			country['properties'][keystring]=int(round(float(row[3])))

with open("./dataset2.json", 'w+') as f:
    json.dump(data, f, indent=2)

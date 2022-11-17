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
numfound = 0
numnot = 0
for country in data['features']:	
	country_code = country['properties']['ISO_A3']
	found=0
	
	# for each row in the csv
	for row in rows:

		# if the country code matches
		if country_code == row[1]:
			found=1
			numfound+=1
			# add the forest area to the country
			#print(row[0], "cool")
			break
	if found==0:
		numnot+=1
		print("MISSED:", country['properties']['SOVEREIGNT'], "CODE:", country_code)
print("FOUND:",numfound)
print("NOT FOUND:",numnot)
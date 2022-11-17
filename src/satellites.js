const EARTH_RADIUS_KM = 6371; // km
const SAT_SIZE = 100; // km
const TIME_STEP = 3 * 1000; // per frame
const satdict = {
	"LANDSAT": [1, 2, 3, 4, 5, 5, 6, 7, 8],
	"ISS":[9],
	"SENTINEL": [10,11,12,13,14,15,16]
};
const COLOR_DICT = {
	"LANDSAT": "red",
	"ISS": "blue",
	"SENTINEL": "green"
}
const timeLogger = document.getElementById('time-log');

const world = Globe()
	(document.getElementById('chart'))
	.globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
	.objectLat('lat')
	.objectLng('lng')
	.objectAltitude('alt')
	.objectLabel('name');

setTimeout(() => world.pointOfView({ altitude: 3.5 }));


function randomMaterial(i)
{
	// fetch the color using COLOR DICT and satdict
	var satType = Object.keys(satdict).find(key => satdict[key].includes(i));
	var colo = COLOR_DICT[satType];

	return {
		color: colo,
		roughness: 0.8,
	};
}
let i = 0;

const satGeometry = new THREE.OctahedronGeometry(SAT_SIZE * 4 * world.getGlobeRadius() / EARTH_RADIUS_KM / 2, 0);
world.objectThreeObject(() =>
{
	i = i + 1
	const mesh = new THREE.Mesh(satGeometry, new THREE.MeshStandardMaterial(randomMaterial(i)));
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
});

fetch('../data/satellites.txt').then(r => r.text()).then(rawData =>
{
	const tleData = rawData.replace(/\r/g, '')
		.split(/\n(?=[^12])/)
		.filter(d => d)
		.map(tle => tle.split('\n'));
	const satData = tleData.map(([name, ...tle]) => ({
		satrec: satellite.twoline2satrec(...tle),
		name: name.trim().replace(/^0 /, '')
	}))
		// exclude those that can't be propagated
		.filter(d => !!satellite.propagate(d.satrec, new Date()).position)
		.slice(0, 2000);

	// time ticker
	let time = new Date();
	(function frameTicker()
	{
		requestAnimationFrame(frameTicker);

		time = new Date(+time + TIME_STEP);
		timeLogger.innerText = time.toString();

		// Update satellite positions
		const gmst = satellite.gstime(time);
		satData.forEach(d =>
		{
			const eci = satellite.propagate(d.satrec, time);
			if (eci.position)
			{
				const gdPos = satellite.eciToGeodetic(eci.position, gmst);
				d.lat = satellite.radiansToDegrees(gdPos.latitude);
				d.lng = satellite.radiansToDegrees(gdPos.longitude);
				d.alt = gdPos.height / EARTH_RADIUS_KM
			}
		});

		world.objectsData(satData);
	})();
});
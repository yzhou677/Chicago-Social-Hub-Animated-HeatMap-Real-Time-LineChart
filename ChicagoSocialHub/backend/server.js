////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/27/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////              SETUP NEEDED                ////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

//  Install Nodejs (the bundle includes the npm) from the following website:
//      https://nodejs.org/en/download/


//  Before you start nodejs make sure you install from the  
//  command line window/terminal the following packages:
//      1. npm install express
//      2. npm install pg
//      3. npm install pg-format
//      4. npm install moment --save
//      5. npm install elasticsearch


//  Read the docs for the following packages:
//      1. https://node-postgres.com/
//      2.  result API: 
//              https://node-postgres.com/api/result
//      3. Nearest Neighbor Search
//              https://postgis.net/workshops/postgis-intro/knn.html    
//      4. https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html
//      5. https://momentjs.com/
//      6. http://momentjs.com/docs/#/displaying/format/


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


const express = require('express');

var pg = require('pg');
const router = express.Router();
const app = express();

var bodyParser = require('body-parser');

const moment = require('moment');

// Connect to elasticsearch Server

const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
    host: '127.0.0.1:9200',
    log: 'error'
});


// Connect to PostgreSQL server

var conString = "pg://postgres:root@127.0.0.1:5432/chicago_divvy_stations";
var pgClient = new pg.Client(conString);
pgClient.connect();

var find_places_task_completed = false;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

router.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});



var places_found = [];
var stations_found = [];
var place_selected;
var station_selected;
var station_selected_info = [];
var stationIdsToMonitor = [];
var entireStationInfo = [];

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//////   The following are the routes received from NG/Browser client        ////////

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



router.route('/places').get((req, res) => {

    res.json(places_found);

});



router.route('/place_selected').get((req, res) => {

    res.json(place_selected);

});



router.route('/allPlaces').get((req, res) => {

    res.json(places_found);

});




router.route('/stations').get((req, res) => {

    res.json(stations_found);

});

router.route('/stations/selected').get((req, res) => {
    sortData(station_selected_info);
    res.json(station_selected_info);

});

router.route(`/stations/entire_city_stations`).get((req, res) => {
    sortData(entireStationInfo);
    res.json(entireStationInfo);

});

router.route(`/stations/entire_city_stations`).post((req, res) => {
    const query = {
        // give the query a unique name
        name: 'fetch_entire_divvy_station',
        text: 'SELECT * FROM divvy_stations_logs WHERE lastcommunicationtime >= (NOW() - INTERVAL \'24 hours\' ) order by lastcommunicationtime'
    }
    find_entire_city_stations_from_divvy(query).then(function (response) {
        var hits = response;
        res.json(entireStationInfo);

    }, function (response) {
        console.log(response); // log error
    });

});




router.route('/places/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    find_places_task_completed = false;

    find_places_from_yelp(req.body.find, req.body.where).then(function (response) {
        var hits = response;
        res.json(places_found);
    });

});

router.route('/stations/selected_seven_day').post((req, res) => {
    var str = JSON.stringify(req.body, null, 4);
    for (var i = 0, len = stations_found.length; i < len; i++) {

        if (stations_found[i].id === req.body.id) { // strict equality test

            station_selected = stations_found[i];

            break;
        }
    }


    stationIdsToMonitor.push(station_selected.id);
    find_selected_stations_from_divvy(station_selected.id).then(function (response) {
        var hits = response;
        res.json(station_selected_info);
    }, function (response) {
        console.log(response); // log error
    });

});

router.route('/stations/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    for (var i = 0, len = places_found.length; i < len; i++) {

        if (places_found[i].name === req.body.placeName) { // strict equality test

            place_selected = places_found[i];

            break;
        }
    }

    const query = {
        // give the query a unique name
        name: 'fetch-divvy',
        text: ' SELECT * FROM divvy_stations_status ORDER BY (divvy_stations_status.where_is <-> ST_POINT($1,$2)) LIMIT 3',
        values: [place_selected.latitude, place_selected.longitude]
    }

    find_stations_from_divvy(query).then(function (response) {
        var hits = response;
        res.json({ 'stations_found': 'Added successfully' });
    });


});

router.route('/stations/removeRegisteredIdOnDestory').post((req, res) => {
    var str = JSON.stringify(req.body, null, 4);
    var index = -1;
    for (let i = 0; i < stationIdsToMonitor.length; i++) {
        if (stationIdsToMonitor[i] == req.body.id) {
            index = i;
            break;
        }
    }
    stationIdsToMonitor = stationIdsToMonitor.slice(0, index).concat(stationIdsToMonitor.slice(index + 1, stationIdsToMonitor.length));
    console.log(req.body.id, " has been removed");
    res.json(places_found);
});

function sortData(stationData) {
    stationData.sort(function (a, b) {
        return new Date(a.lastCommunicationTime.valueOf()) - new Date(b.lastCommunicationTime.valueOf());
    });
}

function withinOneHour(dateBegin, dateEnd) {
    var dateDiff = dateBegin.getTime() - dateEnd.getTime();
    var leave1 = dateDiff % (24 * 3600 * 1000);
    var hours = Math.ceil(leave1 / (3600 * 1000));
    if (hours <= 1) {
        return true;
    } else {
        return false;
    }
}

function getLastSevenDayDateInString(thisDateBegin) {
    var lastSevenDayDateInString = [];
    lastSevenDayDateInString.push(thisDateBegin.toISOString().split('T')[0].toString());
    for (let i = 0; i < 7; i++) {
        lastSevenDayDateInString.push(new Date(thisDateBegin.getTime() - 1000 * 60 * 60 * 24 * (i + 1)).toISOString().split('T')[0].toString());
    }
    return lastSevenDayDateInString;
}
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Divvy - PostgreSQL - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



async function find_entire_city_stations_from_divvy(query) {
    const response = await pgClient.query(query);
    entireStationInfo = [];

    for (i = 0; i < response.rows.length; i++) {
        plainTextDateTime = moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');

        var station = {
            "id": response.rows[i].id,
            "stationName": response.rows[i].stationname,
            "availableBikes": response.rows[i].availablebikes,
            "availableDocks": response.rows[i].availabledocks,
            "is_renting": response.rows[i].is_renting,
            "lastCommunicationTime": plainTextDateTime,
            "latitude": response.rows[i].latitude,
            "longitude": response.rows[i].longitude,
            "status": response.rows[i].status,
            "totalDocks": response.rows[i].totaldocks
        };

        entireStationInfo.push(station);
    }
}

async function find_selected_stations_from_divvy(id) {
    var thisDateBegin = new Date();
    station_selected_info = [];
    var lastSevenDayDateInString = [];
    lastSevenDayDateInString = getLastSevenDayDateInString(thisDateBegin);
    return new Promise(function (resolve, reject) {
        // do a search, and specify a scroll timeout
        esClient.search({
            index: 'divvy_stations_logs',
            scroll: '10s',
            body: {
                "query": {
                    "bool": {
                        "filter": [
                            { "term": { "id": id } },
                            {
                                "query_string": {
                                    "default_field": "lastCommunicationTime", "query": lastSevenDayDateInString[0] + " OR "
                                        + lastSevenDayDateInString[1] + " OR " + lastSevenDayDateInString[2] + " OR " + lastSevenDayDateInString[3] +
                                        " OR " + lastSevenDayDateInString[4] + " OR " + lastSevenDayDateInString[5] + " OR " + lastSevenDayDateInString[6]
                                        + " OR " + lastSevenDayDateInString[7]
                                }
                            }
                        ]
                    }
                }
            }
        }, function getMoreUntilDone(error, response) {
            if (error) {
                return reject(error);
            }
            // collect all the records
            response.hits.hits.forEach((hit) => {
                plainTextDateTime = moment(hit._source.lastCommunicationTime).format('YYYY/MM/DD, h:mm:ss a');

                var station = {
                    "id": hit._source.id,
                    "stationName": hit._source.stationName,
                    "availableBikes": hit._source.availableBikes,
                    "availableDocks": hit._source.availableDocks,
                    "is_renting": hit._source.is_renting,
                    "lastCommunicationTime": plainTextDateTime,
                    "latitude": hit._source.latitude,
                    "longitude": hit._source.longitude,
                    "status": hit._source.status,
                    "totalDocks": hit._source.totalDocks
                };
                var thisDateEnd = new Date(station.lastCommunicationTime.valueOf());
                //if (withinSevenDays(thisDateBegin, thisDateEnd)) {
                station_selected_info.push(station);
                //}

            });

            if (response.hits.total !== station_selected_info.length) {
                // now we can call scroll over and over
                esClient.scroll({
                    scrollId: response._scroll_id,
                    scroll: '10s'
                }, getMoreUntilDone);

            } else {
                console.log('all done');
                return resolve(station_selected_info);

            }
        });
    });

}


async function find_stations_from_divvy(query) {

    const response = await pgClient.query(query);

    stations_found = [];

    for (i = 0; i < 3; i++) {

        plainTextDateTime = moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');


        var station = {
            "id": response.rows[i].id,
            "stationName": response.rows[i].stationname,
            "availableBikes": response.rows[i].availablebikes,
            "availableDocks": response.rows[i].availabledocks,
            "is_renting": response.rows[i].is_renting,
            "lastCommunicationTime": plainTextDateTime,
            "latitude": response.rows[i].latitude,
            "longitude": response.rows[i].longitude,
            "status": response.rows[i].status,
            "totalDocks": response.rows[i].totaldocks
        };

        stations_found.push(station);

    }


}




/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Yelp - ElasticSerch - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



async function find_places_from_yelp(place, where) {

    places_found = [];

    //////////////////////////////////////////////////////////////////////////////////////
    // Using the business name to search for businesses will leead to incomplete results
    // better to search using categorisa/alias and title associated with the business name
    // For example one of the famous places in chicago for HotDogs is Portillos
    // However, it also offers Salad and burgers
    // Here is an example of a busness review from Yelp for Pertilos
    //               alias': 'portillos-hot-dogs-chicago-4',
    //              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
    //                             {'alias': 'salad', 'title': 'Salad'},
    //                             {'alias': 'burgers', 'title': 'Burgers'}],
    //              'name': "Portillo's Hot Dogs",
    //////////////////////////////////////////////////////////////////////////////////////


    let body = {
        size: 1000,
        from: 0,
        "query": {
            "bool": {
                "must": {
                    "term": { "categories.alias": place }
                },


                "filter": {
                    "term": { "location.address1": where }
                },

                "must_not": {
                    "range": {
                        "rating": { "lte": 3 }
                    }
                },

                "must_not": {
                    "range": {
                        "review_count": { "lte": 500 }
                    }
                },

                "should": [
                    { "term": { "is_closed": "false" } }
                ],
            }
        }
    }


    results = await esClient.search({ index: 'chicago_yelp_reviews', body: body });

    results.hits.hits.forEach((hit, index) => {


        var place = {
            "name": hit._source.name,
            "display_phone": hit._source.display_phone,
            "address1": hit._source.location.address1,
            "is_closed": hit._source.is_closed,
            "rating": hit._source.rating,
            "review_count": hit._source.review_count,
            "latitude": hit._source.coordinates.latitude,
            "longitude": hit._source.coordinates.longitude,
            "zip_code": hit._source.location.zip_code
        };

        places_found.push(place);

    });

    find_places_task_completed = true;

}

function removeDuplicateIds(value, index, self) {
    return self.indexOf(value) === index;
}

app.use('/', router);
var server = app.listen(4000, () => console.log('Express server running on port 4000'));
var io = require('socket.io').listen(server);

var minutes = 1;
the_interval = minutes * 60 * 1000;
setInterval(async function () {
    var uniqueIds = stationIdsToMonitor.filter(removeDuplicateIds);
    for (let i = 0; i < uniqueIds.length; i++) {
        var thisDateBegin = new Date()
        esClient.search({
            index: 'divvy_stations_logs',
            scroll: '10s',
            body: {
                "query": {
                    "bool": {
                        "filter": [{ "term": { "id": uniqueIds[i] } },
                        {
                            "query_string": {
                                "default_field": "lastCommunicationTime", "query": thisDateBegin.toISOString().split('T')[0].toString()
                            }
                        }]
                    }
                }
            }
        }, function getMoreUntilDone(error, response) {
            if (error) {
                return reject(error);
            }
            // collect all the records
            response.hits.hits.forEach((hit) => {
                plainTextDateTime = moment(hit._source.lastCommunicationTime).format('YYYY/MM/DD, h:mm:ss a');

                var station = {
                    "id": hit._source.id,
                    "stationName": hit._source.stationName,
                    "availableBikes": hit._source.availableBikes,
                    "availableDocks": hit._source.availableDocks,
                    "is_renting": hit._source.is_renting,
                    "lastCommunicationTime": plainTextDateTime,
                    "latitude": hit._source.latitude,
                    "longitude": hit._source.longitude,
                    "status": hit._source.status,
                    "totalDocks": hit._source.totalDocks
                };
                var thisDateEnd = new Date(station.lastCommunicationTime.valueOf());
                if (withinOneHour(thisDateBegin, thisDateEnd)) {
                    io.sockets.emit(uniqueIds[i], station);
                }
            });

            if (response.hits.total !== station_selected_info.length) {
                // now we can call scroll over and over
                esClient.scroll({
                    scrollId: response._scroll_id,
                    scroll: '10s'
                }, getMoreUntilDone);

            } else {
                console.log('all done');
            }
        });
    }
}, the_interval);

io.on('connection', function (socket) {
    console.log('a user connected');
});
// src/lib/amadeus.
import Amadeus from 'amadeus';
import { format, addDays } from 'date-fns';

// Define types for our response
interface FlightSegment {
    departure: {
        iataCode: string;
        at: string;
    };
    arrival: {
        iataCode: string;
        at: string;
    };
    carrierCode: string;
    number: string;
    duration: string;
}

interface FlightItinerary {
    duration: string;
    segments: FlightSegment[];
}

interface FlightOffer {
    type: string;
    id: string;
    source: string;
    price: {
        currency: string;
        total: string;
        base: string;
        fees: Array<{ amount: string; type: string }>;
    };
    itineraries: FlightItinerary[];
    validatingAirlineCodes: string[];
}

export async function searchFlightOffers(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    travelClass?: string;
    maxResults?: number;
}) {
    try {
        // Initialize the Amadeus client
        const amadeus = new Amadeus({
            clientId: 'o2ZdyX4fpADi41Xy04iptT2VrlCdkjQC',
            clientSecret: 'fKAC3n5g3dTlBiWB'
        });

        // Set search parameters from the function arguments
        const {
            origin,
            destination,
            departureDate,
            returnDate,
            adults,
            travelClass,
            maxResults = 5
        } = params;

        const currency = 'USD'; // Or get from params if needed

        // Make API call
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: departureDate,
            returnDate: returnDate,
            adults: adults,
            currencyCode: currency,
            max: maxResults,
            travelClass: travelClass
        });

        // Process the response
        if (response.data && response.data.length > 0) {
            console.log(`Found ${response.data.length} flight offers:`);

            // Log the first result
            console.log(JSON.stringify(response.data[0], null, 2));

            // Process all results
            const processedOffers = response.data.map((offer: FlightOffer, i: number) => {
                const price = offer.price.total;
                const currency = offer.price.currency;

                // Get information about the outbound flight
                const outbound = offer.itineraries[0].segments[0];
                const departure = outbound.departure.iataCode;
                const arrival = outbound.arrival.iataCode;
                const carrier = outbound.carrierCode;

                console.log(`Offer ${i+1}: ${departure} to ${arrival} - ${price} ${currency} with ${carrier}`);

                return {
                    id: offer.id,
                    price: {
                        total: price,
                        currency: currency
                    },
                    departure: {
                        iataCode: departure,
                        at: outbound.departure.at
                    },
                    arrival: {
                        iataCode: arrival,
                        at: outbound.arrival.at
                    },
                    carrier: carrier
                };
            });

            return processedOffers;
        } else {
            console.log("No flight offers found");
            return [];
        }

    } catch (error) {
        console.error("Error searching for flights:", error);
        return [];
    }
}
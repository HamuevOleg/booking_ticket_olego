// src/lib/amadeus.js
import Amadeus from 'amadeus';
import { format, addDays } from 'date-fns';

export async function searchFlightOffers() {
  try {
    // Initialize the Amadeus client
    const amadeus = new Amadeus({
      clientId: 'o2ZdyX4fpADi41Xy04iptT2VrlCdkjQC',
      clientSecret: 'fKAC3n5g3dTlBiWB'
    });

    // Set search parameters
    const origin = 'NYC';                                // Origin city code
    const destination = 'LAX';                           // Destination city code
    const departureDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');  // 30 days from now
    const adults = 1;                                    // Number of adult travelers

    // Optional parameters
    const returnDate = format(addDays(new Date(), 37), 'yyyy-MM-dd');  // 37 days from now
    const currency = 'EUR';                              // Currency for prices
    const maxResults = 5;                                // Max number of results to return
    const travelClass = "ECONOMY";

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
      const processedOffers = response.data.map((offer, i) => {
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
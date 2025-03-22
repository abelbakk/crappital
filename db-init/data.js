db = db.getSiblingDB("crappital");

db.users.insertMany([
    {
        firstName: "Bernd",
        lastName: "Weiss",
        email: "berndw@crappital.com",
        password: "$2b$10$/WvHjCHwOJesaKGDpOUWRuXA3QTF82mGwOU4wB14Dkv35.fj1ZtaS",
        phone: "49 036845 40 00",
        address: {
            postalCode: "98559",
            country: "Germany",
            county: "Thuringia",
            city: "Gehlberg",
            street: "Oldesloer Strasse",
            number: "3",
            additionalDetails: ""
        },
        isAdmin: true
    },
    {
        firstName: "Jorben",
        lastName: "van den Nouweland",
        email: "jorbenvdn@geemail.com",
        password: "$2b$10$/WvHjCHwOJesaKGDpOUWRuXA3QTF82mGwOU4wB14Dkv35.fj1ZtaS",
        phone: "31 06-13788137",
        address: {
            postalCode: "1601",
            country: "Netherlands",
            county: "West-Frisia",
            city: "Enkhuizen",
            street: "Westerstraat",
            number: "34",
            additionalDetails: "3/C/42"
        },
        isAdmin: false
    }
]);

print("MongoDB initialization complete");
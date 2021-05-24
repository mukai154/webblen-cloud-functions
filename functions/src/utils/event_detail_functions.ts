function getEventCategoryFromDesc(eventDesc: string) {
    let category = "";
    const lowercaseDesc = eventDesc.toLowerCase();
    if (lowercaseDesc.includes("car") || lowercaseDesc.includes("boat") || lowercaseDesc.includes("airplane")){
        category = "Auto, Boat, & Air";
    }
    if (lowercaseDesc.includes("business") || lowercaseDesc.includes("professional") || lowercaseDesc.includes("career") || lowercaseDesc.includes("personal development")){
        category = "Business/Professional";
    }
    if (lowercaseDesc.includes("charity") || lowercaseDesc.includes("donate") || lowercaseDesc.includes("donation")){
        category = "Charity/Causes";
    }
    if (lowercaseDesc.includes("family") || lowercaseDesc.includes("child") || lowercaseDesc.includes("kid")){
        category = "Family & Education";
    }
    if (lowercaseDesc.includes("fashion") || lowercaseDesc.includes("beauty") || lowercaseDesc.includes("modeling")){
        category = "Fashion & Beauty";
    }
    if (lowercaseDesc.includes("film") || lowercaseDesc.includes("movie") || lowercaseDesc.includes("media")){
        category = "Film, Media, & Entertainment";
    }
    if (lowercaseDesc.includes("food") || lowercaseDesc.includes("drink") || lowercaseDesc.includes("meal") || lowercaseDesc.includes("dinner") || lowercaseDesc.includes("lunch") || lowercaseDesc.includes("breakfast")){
        category = "Food/Drink";
    }
    if (lowercaseDesc.includes("government") || lowercaseDesc.includes("politic") || lowercaseDesc.includes("election")){
        category = "Government/Politics";
    }
    if (lowercaseDesc.includes("health") || lowercaseDesc.includes("wellness")){
        category = "Health & Wellness";
    }
    if (lowercaseDesc.includes("lifestyle") || lowercaseDesc.includes("furniture") || lowercaseDesc.includes("home decor")){
        category = "Home/Lifestyle";
    }
    if (lowercaseDesc.includes("music") || lowercaseDesc.includes("concert") || lowercaseDesc.includes("performance")){
        category = "Music";
    }
    if (lowercaseDesc.includes("religion") || lowercaseDesc.includes("religious")){
        category = "Religion/Spirituality";
    }
    if (lowercaseDesc.includes("school")){
        category = "School Activities";
    }
    if (lowercaseDesc.includes("science") || lowercaseDesc.includes("tech")){
        category = "Science/Technology";
    }
    if (lowercaseDesc.includes("christmas") || lowercaseDesc.includes("thanksgiving") || lowercaseDesc.includes("halloween") || lowercaseDesc.includes('holiday') || lowercaseDesc.includes("seasonal")){
        category = "Seasonal/Holiday";
    }
    if (lowercaseDesc.includes("sports") || lowercaseDesc.includes("competition") || lowercaseDesc.includes("championship")){
        category = "Sports/Fitness";
    }
    if (lowercaseDesc.includes("theatre") || lowercaseDesc.includes("visual arts") || lowercaseDesc.includes("exhibit")){
        category = "Theatre/Visual Arts";
    }
    if (lowercaseDesc.includes("travel") || lowercaseDesc.includes("outdoor") || lowercaseDesc.includes("hiking") || lowercaseDesc.includes("running") || lowercaseDesc.includes("biking")){
        category = "Travel/Outdoor";
    }
    if (category === ""){
        category = "Hobbies/Special Interests";
    }
    return category;
}

function getEventTypeFromDesc(eventDesc: string) {
    let type = "";
    const lowercaseDesc = eventDesc.toLowerCase();
    if (lowercaseDesc.includes("appearance") || lowercaseDesc.includes("signing")){
        type = "Appearance/Signing";
    }
    if (lowercaseDesc.includes("festival") || lowercaseDesc.includes("attraction") || lowercaseDesc.includes("carnival") || lowercaseDesc.includes("fair")){
        type = "Festival/Fair";
    }
    if (lowercaseDesc.includes("camp") || lowercaseDesc.includes("trip") || lowercaseDesc.includes("retreat")){
        type = "Camp, Trip, or Retreat";
    }
    if (lowercaseDesc.includes("class") || lowercaseDesc.includes("workshop") || lowercaseDesc.includes("training")){
        type = "Class, Training, or Workship";
    }
    if (lowercaseDesc.includes("concert") || lowercaseDesc.includes("performance")){
        type = "Concert/Performance";
    }
    if (lowercaseDesc.includes("conference")){
        type = "Conference";
    }
    if (lowercaseDesc.includes("food") || lowercaseDesc.includes("drink") || lowercaseDesc.includes("meal") || lowercaseDesc.includes("dinner") || lowercaseDesc.includes("lunch") || lowercaseDesc.includes("breakfast")){
        type = "Dinner/Gala";
    }
    if (lowercaseDesc.includes("gaming") || lowercaseDesc.includes("e-sports") || lowercaseDesc.includes("gaming tournament")){
        type = "E-Sports Tournament";
    }
    if (lowercaseDesc.includes("network") || lowercaseDesc.includes("networking")){
        type = "Networking Event";
    }
    if (lowercaseDesc.includes("party") || lowercaseDesc.includes("meetup") || lowercaseDesc.includes("get together")){
        type = "Party/Social Gathering";
    }
    if (lowercaseDesc.includes("race") || lowercaseDesc.includes("endurance") || lowercaseDesc.includes("marathon")){
        type = "Race/Endurance Event";
    }
    if (lowercaseDesc.includes("rally")){
        type = "Rally";
    }
    if (lowercaseDesc.includes("screening")){
        type = "Screening";
    }
    if (lowercaseDesc.includes("seminar")){
        type = "Seminar/Talk";
    }
    if (lowercaseDesc.includes("tour")){
        type = "Tour";
    }
    if (lowercaseDesc.includes("tournament")){
        type = "Tournament";
    }
    if (lowercaseDesc.includes("trade show") || lowercaseDesc.includes("tradeshow") || lowercaseDesc.includes("expo")){
        type = "Tradeshow/Expo";
    }
    if (type === ""){
        type = "Other";
    }
    return type;
}
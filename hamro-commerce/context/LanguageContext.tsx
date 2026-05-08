import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'ne';
  setLanguage: (lang: 'en' | 'ne') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    home: 'Home',
    shop: 'Shop',
    blog: 'Blog',
    gallery: 'Gallery',
    about: 'About',
    contact: 'Contact',
    cart: 'Cart',
    login: 'Login',
    logout: 'Logout',
    search: 'Search',
    wishlist: 'Wishlist',
    support: 'Support',
    english: 'English',
    nepali: 'नेपाली',
    hi: 'Hi',
    signUp: 'Sign Up',
    
    // Hero Section
    megaSale: 'Mega Sale',
    specialOffer: 'Special Offer',
    upTo60Off: 'Up to 60% OFF',
    blackFriday: 'Black Friday',
    exclusiveDeals: 'Exclusive Deals',
    upTo70Off: 'Up to 70% OFF',
    holidaySale: 'Holiday Sale',
    limitedTime: 'Limited Time',
    upTo65Off: 'Up to 65% OFF',
    yearEndClearance: 'Year End Clearance',
    finalChance: 'Final Chance',
    upTo80Off: 'Up to 80% OFF',
    shopNow: 'Shop Now',
    buyNow: 'Buy Now',
    hotDeals: 'Hot Deals of The Day',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    
    // Categories
    shopByCategory: 'Shop by Category',
    exploreProducts: 'Explore our wide range of products',
    electronics: 'Electronics',
    clothingFashion: 'Clothing & Fashion',
    homeKitchen: 'Home & Kitchen',
    beautyPersonalCare: 'Beauty & Personal Care',
    sportsOutdoors: 'Sports & Outdoors',
    booksStationery: 'Books & Stationery',
    toysGames: 'Toys & Games',
    groceryEssentials: 'Grocery & Essentials',
    items: 'Items',
    
    // Products
    topPicks: 'Top Picks This Week',
    viewAllProducts: 'View All Products',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    
    // Benefits
    fastDelivery: 'Fast Worldwide Delivery',
    freeShipping: 'Free shipping on orders over $50',
    secureShoppingTitle: '100% Secure Shopping',
    secureShoppingDesc: 'Verified sellers & genuine products',
    customerSupportTitle: '24/7 Customer Support',
    customerSupportDesc: 'Chat, call, or email anytime',
    
    // Deal Section
    holidaySpecial: 'Holiday Special',
    limitedTimeOnly: 'Limited Time Only!',
    grabDeals: 'Grab Deals Now',
    
    // Newsletter
    stayUpdated: 'Stay Updated on Deals',
    joinShoppers: 'Join 50,000+ shoppers for exclusive offers and updates',
    yourEmail: 'Your email address',
    subscribeNow: 'Subscribe Now',
    
    // Product Details
    backToShop: 'Back to Shop',
    reviews: 'Reviews',
    verifiedReviews: 'Verified Reviews',
    loading: 'Loading',
    productNotFound: 'Product not found',
    
    // Cart & Checkout
    yourCart: 'Your Cart',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    orderTotal: 'Order Total',
    placeOrder: 'Place Order',
    
    // Order Success
    orderSuccess: 'Order Placed Successfully!',
    thankYou: 'Thank you for shopping with us!',
    orderDetails: 'Order Details',
    viewCart: 'View Cart',
    paymentDetails: 'Payment Details',
    
    // Footer
    shopAndLearn: 'Shop & Learn',
    shopAll: 'Shop All',
    latestNews: 'Latest News',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    headOffice: 'Head Office',
    phone: 'Phone',
    newsletter: 'Newsletter',
    subscribeNewsletter: 'Subscribe to get special offers and deals directly to your inbox.',
    allRightsReserved: 'All rights reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    returns: 'Returns',
    
    // Shop Page
    ourShop: 'Our Shop',
    exploreWideRange: 'Explore our wide range of authentic products.',
    allProducts: 'All Products',
    showing: 'Showing',
    searchProducts: 'Search products...',
    categories: 'Categories',
    all: 'All',
    subcategories: 'Subcategories',
    allSubcategories: 'All Subcategories',
    noProducts: 'No products found',
    tryDifferentFilter: 'Try adjusting your filters to find what you are looking for.',
    loadingProducts: 'Loading products...',
    
    // Contact Page
    getInTouch: 'Get in Touch',
    loveToHear: 'We\'d love to hear from you. Here is how you can reach us.',
    contactInformation: 'Contact Information',
    phoneNumber: 'Phone Number',
    emailSupport: 'Email Support',
    sendMessage: 'Send us a Message',
    firstName: 'First Name',
    lastName: 'Last Name',
    emailAddress: 'Email Address',
    subject: 'Subject',
    message: 'Message',
    sendMessageBtn: 'Send Message',
    generalInquiry: 'General Inquiry',
    orderStatus: 'Order Status',
    returnsRefund: 'Returns & Refund',
    businessPartnership: 'Business Partnership',
    howCanWeHelp: 'How can we help you?',
    
    // About Page
    connectingCraftsmanship: 'Connecting Nepali Craftsmanship with the World.',
    ourStory: 'Our Story',
    buildingFuture: 'We are building the future of commerce in Nepal.',
    aboutStoryText1: 'Hamro Commerce started with a simple idea: to make high-quality Nepali products accessible to everyone, everywhere. Founded in 2023, we have grown from a small garage operation in Kathmandu to a nationwide platform serving thousands of happy customers.',
    aboutStoryText2: 'We believe in the power of technology to transform lives. By connecting local artisans and businesses directly with consumers, we are cutting out middlemen and ensuring fair prices for everyone.',
    happyCustomers: 'Happy Customers',
    localBrands: 'Local Brands',
    whyChooseUs: 'Why Choose Hamro Commerce?',
    whyChooseUsDesc: 'We stand by our core values to deliver the best shopping experience.',
    missionDriven: 'Mission Driven',
    missionDesc: 'To revolutionize the eCommerce landscape in Nepal by ensuring authenticity, speed, and trust in every transaction.',
    customerFirst: 'Customer First',
    customerFirstDesc: 'We obsess over our customers. From 24/7 support to easy returns, your satisfaction is our top priority.',
    communityFocused: 'Community Focused',
    communityDesc: 'We empower local sellers. Every purchase you make supports a Nepali family and strengthens our economy.',
    meetLeadership: 'Meet the Leadership',
    
    // Blog Page
    ourBlog: 'Our Blog',
    storiesFromNepal: 'Stories, tips, and trends from the heart of Nepal.',
    readMore: 'Read More',
    
    // Cart Page
    shoppingCart: 'Shopping Cart',
    yourCartEmpty: 'Your cart is empty',
    cartEmptyDesc: 'Looks like you haven\'t added anything yet. Explore our top categories and find something you love.',
    startShopping: 'Start Shopping',
    selectAll: 'Select All',
    remove: 'Remove',
    updateQuantity: 'Update Quantity',
    orderSummary: 'Order Summary',
    proceedToCheckout: 'Proceed to Checkout',
    clearCart: 'Clear Cart',
    noItemsSelected: 'No Items Selected',
    selectAtLeastOne: 'Please select at least one item to checkout',
    loadingCart: 'Loading your cart...',
    
    // Checkout Page
    checkoutTitle: 'Checkout',
    shippingInformation: 'Shipping Information',
    fullName: 'Full Name',
    phoneNo: 'Phone Number',
    address: 'Address',
    city: 'City',
    district: 'District',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash On Delivery',
    orderSummaryTitle: 'Order Summary',
    itemsSelected: 'items selected',
    deliveryCharge: 'Delivery Charge',
    free: 'Free',
    placeOrderBtn: 'Place Order',
    processing: 'Processing...',
    pleaseWait: 'Please wait...',
  },
  ne: {
    // Navigation
    home: 'गृहपृष्ठ',
    shop: 'पसल',
    blog: 'ब्लग',
    gallery: 'ग्यालेरी',
    about: 'बारेमा',
    contact: 'सम्पर्क',
    cart: 'कार्ट',
    login: 'लगइन',
    logout: 'लगआउट',
    search: 'खोज्नुहोस्',
    wishlist: 'इच्छा सूची',
    support: 'समर्थन',
    english: 'English',
    nepali: 'नेपाली',
    hi: 'नमस्ते',
    signUp: 'साइन अप',
    
    // Hero Section
    megaSale: 'मेगा बिक्री',
    specialOffer: 'विशेष प्रस्ताव',
    upTo60Off: '६०% सम्म छुट',
    blackFriday: 'ब्ल्याक फ्राइडे',
    exclusiveDeals: 'विशेष सम्झौता',
    upTo70Off: '७०% सम्म छुट',
    holidaySale: 'छुट्टी बिक्री',
    limitedTime: 'सीमित समय',
    upTo65Off: '६५% सम्म छुट',
    yearEndClearance: 'वर्ष अन्त्य क्लियरेन्स',
    finalChance: 'अन्तिम मौका',
    upTo80Off: '८०% सम्म छुट',
    shopNow: 'अहिले किन्नुहोस्',
    buyNow: 'अहिले किन्नुहोस्',
    hotDeals: 'आजको तातो सौदा',
    days: 'दिन',
    hours: 'घण्टा',
    minutes: 'मिनेट',
    seconds: 'सेकेन्ड',
    
    // Categories
    shopByCategory: 'श्रेणी अनुसार किनमेल',
    exploreProducts: 'हाम्रो उत्पादनहरूको विस्तृत श्रृंखला अन्वेषण गर्नुहोस्',
    electronics: 'इलेक्ट्रोनिक्स',
    clothingFashion: 'कपडा र फेसन',
    homeKitchen: 'घर र भान्सा',
    beautyPersonalCare: 'सौन्दर्य र व्यक्तिगत हेरचाह',
    sportsOutdoors: 'खेलकुद र बाहिरी',
    booksStationery: 'किताब र स्टेशनरी',
    toysGames: 'खेलौना र खेल',
    groceryEssentials: 'किराना र आवश्यक सामान',
    items: 'वस्तुहरू',
    
    // Products
    topPicks: 'यस हप्ताको शीर्ष छनोट',
    viewAllProducts: 'सबै उत्पादनहरू हेर्नुहोस्',
    addToCart: 'कार्टमा थप्नुहोस्',
    outOfStock: 'स्टकमा छैन',
    inStock: 'स्टकमा छ',
    price: 'मूल्य',
    quantity: 'परिमाण',
    total: 'जम्मा',
    
    // Benefits
    fastDelivery: 'छिटो विश्वव्यापी डेलिभरी',
    freeShipping: '$५० भन्दा बढी अर्डरमा निःशुल्क ढुवानी',
    secureShoppingTitle: '१००% सुरक्षित किनमेल',
    secureShoppingDesc: 'प्रमाणित विक्रेता र वास्तविक उत्पादन',
    customerSupportTitle: '२४/७ ग्राहक समर्थन',
    customerSupportDesc: 'जुनसुकै समय च्याट, कल, वा इमेल गर्नुहोस्',
    
    // Deal Section
    holidaySpecial: 'छुट्टी विशेष',
    limitedTimeOnly: 'सीमित समय मात्र!',
    grabDeals: 'अहिले नै सौदा लिनुहोस्',
    
    // Newsletter
    stayUpdated: 'सम्झौतामा अद्यावधिक रहनुहोस्',
    joinShoppers: 'विशेष प्रस्ताव र अपडेटहरूको लागि ५०,०००+ खरिदकर्तासँग सामेल हुनुहोस्',
    yourEmail: 'तपाईंको इमेल ठेगाना',
    subscribeNow: 'अहिले सदस्यता लिनुहोस्',
    
    // Product Details
    backToShop: 'पसलमा फर्कनुहोस्',
    reviews: 'समीक्षा',
    verifiedReviews: 'प्रमाणित समीक्षाहरू',
    loading: 'लोड हुँदैछ',
    productNotFound: 'उत्पादन भेटिएन',
    
    // Cart & Checkout
    yourCart: 'तपाईंको कार्ट',
    emptyCart: 'तपाईंको कार्ट खाली छ',
    continueShopping: 'किनमेल जारी राख्नुहोस्',
    checkout: 'चेकआउट',
    subtotal: 'उप-योग',
    shipping: 'ढुवानी',
    orderTotal: 'आदेश जम्मा',
    placeOrder: 'आदेश दिनुहोस्',
    
    // Order Success
    orderSuccess: 'आदेश सफलतापूर्वक राखियो!',
    thankYou: 'हामीसँग किनमेल गर्नुभएकोमा धन्यवाद!',
    orderDetails: 'आदेश विवरण',
    viewCart: 'कार्ट हेर्नुहोस्',
    paymentDetails: 'भुक्तानी विवरण',
    
    // Footer
    shopAndLearn: 'किनमेल र सिक्नुहोस्',
    shopAll: 'सबै किन्नुहोस्',
    latestNews: 'ताजा समाचार',
    aboutUs: 'हाम्रो बारेमा',
    contactUs: 'सम्पर्क',
    headOffice: 'प्रधान कार्यालय',
    phone: 'फोन',
    newsletter: 'न्यूजलेटर',
    subscribeNewsletter: 'विशेष प्रस्ताव र सम्झौताहरू सिधै तपाईंको इनबक्समा प्राप्त गर्न सदस्यता लिनुहोस्।',
    allRightsReserved: 'सर्वाधिकार सुरक्षित',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा सर्तहरू',
    returns: 'फिर्ता',
    
    // Shop Page
    ourShop: 'हाम्रो पसल',
    exploreWideRange: 'हाम्रो प्रामाणिक उत्पादनहरूको विस्तृत श्रृंखला अन्वेषण गर्नुहोस्।',
    allProducts: 'सबै उत्पादनहरू',
    showing: 'देखाउँदै',
    searchProducts: 'उत्पादनहरू खोज्नुहोस्...',
    categories: 'श्रेणीहरू',
    all: 'सबै',
    subcategories: 'उप-श्रेणीहरू',
    allSubcategories: 'सबै उप-श्रेणीहरू',
    noProducts: 'कुनै उत्पादन भेटिएन',
    tryDifferentFilter: 'तपाईंले खोजिरहनुभएको कुरा फेला पार्न आफ्नो फिल्टरहरू समायोजन गर्ने प्रयास गर्नुहोस्।',
    loadingProducts: 'उत्पादनहरू लोड हुँदैछ...',
    
    // Contact Page
    getInTouch: 'सम्पर्कमा रहनुहोस्',
    loveToHear: 'हामी तपाईंबाट सुन्न मन पराउँछौं। यहाँ तपाईं हामीलाई कसरी सम्पर्क गर्न सक्नुहुन्छ।',
    contactInformation: 'सम्पर्क जानकारी',
    phoneNumber: 'फोन नम्बर',
    emailSupport: 'इमेल समर्थन',
    sendMessage: 'हामीलाई सन्देश पठाउनुहोस्',
    firstName: 'पहिलो नाम',
    lastName: 'थर',
    emailAddress: 'इमेल ठेगाना',
    subject: 'विषय',
    message: 'सन्देश',
    sendMessageBtn: 'सन्देश पठाउनुहोस्',
    generalInquiry: 'सामान्य सोधपुछ',
    orderStatus: 'आदेश स्थिति',
    returnsRefund: 'फिर्ता र रिफन्ड',
    businessPartnership: 'व्यापार साझेदारी',
    howCanWeHelp: 'हामी तपाईंलाई कसरी मद्दत गर्न सक्छौं?',
    
    // About Page
    connectingCraftsmanship: 'नेपाली शिल्पकलालाई विश्वसँग जोड्दै।',
    ourStory: 'हाम्रो कथा',
    buildingFuture: 'हामी नेपालमा वाणिज्यको भविष्य निर्माण गर्दैछौं।',
    aboutStoryText1: 'हमरो कमर्स एक सरल विचारबाट सुरु भयो: उच्च-गुणस्तरको नेपाली उत्पादनहरू सबैलाई, जहाँसुकै पहुँचयोग्य बनाउन। २०२३ मा स्थापना भएको, हामी काठमाडौंको एउटा सानो ग्यारेज अपरेशनबाट हजारौं खुसी ग्राहकहरूलाई सेवा दिने राष्ट्रव्यापी प्लेटफर्ममा बढेका छौं।',
    aboutStoryText2: 'हामी जीवन परिवर्तन गर्न प्रविधिको शक्तिमा विश्वास गर्छौं। स्थानीय कारीगर र व्यवसायहरूलाई सीधै उपभोक्ताहरूसँग जोडेर, हामी बिचौलियाहरू हटाउँदैछौं र सबैका लागि उचित मूल्य सुनिश्चित गर्दैछौं।',
    happyCustomers: 'खुसी ग्राहकहरू',
    localBrands: 'स्थानीय ब्रान्डहरू',
    whyChooseUs: 'हमरो कमर्स किन रोज्ने?',
    whyChooseUsDesc: 'हामी उत्कृष्ट किनमेल अनुभव प्रदान गर्न हाम्रो मूल मूल्यहरूमा खडा छौं।',
    missionDriven: 'मिशन संचालित',
    missionDesc: 'प्रत्येक लेनदेनमा प्रामाणिकता, गति र विश्वास सुनिश्चित गरेर नेपालमा ई-कमर्स परिदृश्यमा क्रान्ति ल्याउन।',
    customerFirst: 'ग्राहक पहिले',
    customerFirstDesc: 'हामी हाम्रा ग्राहकहरूको लागि जुनून राख्छौं। २४/७ समर्थनदेखि सजिलो फिर्तासम्म, तपाईंको सन्तुष्टि हाम्रो शीर्ष प्राथमिकता हो।',
    communityFocused: 'समुदाय केन्द्रित',
    communityDesc: 'हामी स्थानीय विक्रेताहरूलाई सशक्त बनाउँछौं। तपाईंले गर्ने प्रत्येक खरिदले नेपाली परिवारलाई समर्थन गर्दछ र हाम्रो अर्थतन्त्रलाई बलियो बनाउँछ।',
    meetLeadership: 'नेतृत्वलाई भेट्नुहोस्',
    
    // Blog Page
    ourBlog: 'हाम्रो ब्लग',
    storiesFromNepal: 'नेपालको मुटुबाट कथाहरू, सुझावहरू र प्रवृत्तिहरू।',
    readMore: 'थप पढ्नुहोस्',
    
    // Cart Page
    shoppingCart: 'किनमेल कार्ट',
    yourCartEmpty: 'तपाईंको कार्ट खाली छ',
    cartEmptyDesc: 'तपाईंले अहिलेसम्म केही थप्नुभएको छैन जस्तो देखिन्छ। हाम्रो शीर्ष श्रेणीहरू अन्वेषण गर्नुहोस् र तपाईंलाई मनपर्ने केही फेला पार्नुहोस्।',
    startShopping: 'किनमेल सुरु गर्नुहोस्',
    selectAll: 'सबै चयन गर्नुहोस्',
    remove: 'हटाउनुहोस्',
    updateQuantity: 'मात्रा अपडेट गर्नुहोस्',
    orderSummary: 'आदेश सारांश',
    proceedToCheckout: 'चेकआउटमा जानुहोस्',
    clearCart: 'कार्ट खाली गर्नुहोस्',
    noItemsSelected: 'कुनै वस्तु चयन गरिएको छैन',
    selectAtLeastOne: 'कृपया चेकआउट गर्न कम्तिमा एउटा वस्तु चयन गर्नुहोस्',
    loadingCart: 'तपाईंको कार्ट लोड हुँदैछ...',
    
    // Checkout Page
    checkoutTitle: 'चेकआउट',
    shippingInformation: 'ढुवानी जानकारी',
    fullName: 'पूरा नाम',
    phoneNo: 'फोन नम्बर',
    address: 'ठेगाना',
    city: 'शहर',
    district: 'जिल्ला',
    paymentMethod: 'भुक्तानी विधि',
    cashOnDelivery: 'डेलिभरीमा नगद',
    orderSummaryTitle: 'आदेश सारांश',
    itemsSelected: 'वस्तुहरू चयन गरियो',
    deliveryCharge: 'डेलिभरी शुल्क',
    free: 'निःशुल्क',
    placeOrderBtn: 'आदेश दिनुहोस्',
    processing: 'प्रशोधन गर्दै...',
    pleaseWait: 'कृपया पर्खनुहोस्...',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'ne'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ne' | null;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: 'en' | 'ne') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

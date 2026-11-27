#!/usr/bin/env python3
"""Topic vocabulary for themed puzzles.

Each topic lists on-theme answers: phrases that can be theme entries, plus
shorter words the filler can use to carry the theme through the grid. Every
entry needs Easy/Medium/Hard clues in clues.tsv like any other answer.

  python3 topics.py list                 # topics, sizes and clue coverage
  python3 topics.py missing [topic ...]  # entries that still need clues
  python3 topics.py themes TOPIC [n]     # theme sets that fit a 15x15 grid

A daily in themes.py can name a topic as a third item:
    "2027-02-14": ("Be Mine", ["LOVE LETTERS", "RED ROSES ...", "CUPID"], "valentines")
and daily.py nudges the fill toward that topic's words.
"""
import itertools
import random
import sys

import lib

# Lengths a theme entry can have in a 15-wide row (see themes.py).
PAIR_LENGTHS = set(range(3, 12)) | {13, 14}

TOPICS = {
    # ---- Winter and the new year ----
    "newyear": ("New Year", [
        "NEW YEAR", "NEW YEARS DAY", "RESOLUTION", "FRESH START", "CLEAN SLATE",
        "BALL DROP", "COUNTDOWN", "MIDNIGHT", "CONFETTI", "CHAMPAGNE", "TOAST",
        "PARTY HATS", "NOISEMAKER", "AULD LANG SYNE", "FIREWORKS", "STROKE OF MIDNIGHT",
        "NEW CALENDAR", "GYM MEMBERSHIP", "JANUARY", "TIMES SQUARE", "KISS", "CHEERS",
        "YEAR IN REVIEW", "BRUNCH", "GOALS", "PLANNER", "STREAMERS", "TICKER TAPE",
        "CLINK", "TOOT", "HOORAY", "DECADE", "ANNUAL", "ERA",
        "NEW LEAF", "BUBBLES", "SPARKLE",
    ]),
    "winter": ("Winter", [
        "SNOWFLAKE", "SNOWFALL", "SNOWBALL FIGHT", "SNOW DAY", "SNOWMAN", "SNOW ANGEL",
        "BLIZZARD", "ICICLE", "FROST", "SLEET", "HOT COCOA", "HOT CHOCOLATE",
        "FIREPLACE", "MITTENS", "EARMUFFS", "SCARF", "PARKA", "SKI LIFT", "SKI LODGE",
        "SLEDDING", "TOBOGGAN", "IGLOO", "POLAR VORTEX", "WIND CHILL", "COLD SNAP",
        "SNOW BOOTS", "WOOLLY HAT", "FLANNEL", "QUILT", "CHILLY", "FROSTY", "ICY",
        "BRR", "SKI", "SLED", "THAW", "HIBERNATE", "FLURRY", "DRIFT", "PLOW",
    ]),
    "mlk": ("A Day of Service", [
        "I HAVE A DREAM", "CIVIL RIGHTS", "ROSA PARKS", "BUS BOYCOTT", "DAY OF SERVICE",
        "FREEDOM RIDERS", "NOBEL PEACE PRIZE", "LUNCH COUNTER", "SIT IN", "MARCH",
        "SELMA", "MONTGOMERY", "ATLANTA", "BIRMINGHAM", "EQUALITY", "JUSTICE",
        "NONVIOLENCE", "DREAM", "DREAMER", "SPEECH", "PREACHER", "SERMON",
        "VOTING RIGHTS", "FREEDOM", "UNITY", "PEACE", "HOPE", "LEGACY", "MEMORIAL",
        "VOLUNTEER", "SERVICE",
    ]),
    "lunarnewyear": ("Lunar New Year", [
        "RED ENVELOPE", "LUCKY MONEY", "LION DANCE", "DRAGON DANCE", "FIRECRACKERS",
        "DUMPLINGS", "SPRING ROLLS", "LANTERN", "LANTERN FESTIVAL", "PAPER LANTERN",
        "ZODIAC", "YEAR OF THE GOAT", "GOAT", "RAM", "TANGERINE", "KUMQUAT",
        "NOODLES", "LONG LIFE", "PROSPERITY", "GOOD FORTUNE", "FAMILY DINNER",
        "REUNION", "DRUMS", "GONGS", "CYMBALS", "RED", "GOLD", "SPRING", "LUCK",
        "TEA", "RICE CAKE", "MOON", "CALENDAR",
    ]),
    "groundhog": ("Groundhog Day", [
        "GROUNDHOG", "GROUNDHOG DAY", "WOODCHUCK", "SHADOW", "SIX MORE WEEKS",
        "EARLY SPRING", "BURROW", "FORECAST", "PREDICTION", "PENNSYLVANIA",
        "TOP HAT", "WEATHERMAN", "HIBERNATION", "GOBBLER'S KNOB", "FEBRUARY",
        "BURROWS", "PEEK", "SEER", "OMEN", "DEN", "HOLE", "RODENT", "MARMOT",
        "OUTLOOK", "WEATHER", "SHADOWS", "FORESEE",
    ]),
    "football": ("Game Day", [
        "TOUCHDOWN", "FIELD GOAL", "END ZONE", "KICKOFF", "QUARTERBACK", "HAIL MARY",
        "FIRST DOWN", "WIDE RECEIVER", "LINEBACKER", "GOALPOSTS", "COIN TOSS",
        "HALFTIME", "HALFTIME SHOW", "TAILGATE", "TAILGATING", "CHICKEN WINGS",
        "NACHOS", "GUACAMOLE", "SEVEN LAYER DIP", "REFEREE", "FUMBLE", "PUNT",
        "SAFETY", "BLITZ", "HUDDLE", "SIDELINE", "PIGSKIN", "GRIDIRON", "YARD LINE",
        "SNAP", "SACK", "SPIKE", "COACH", "HELMET", "JERSEY", "TEAM", "FANS",
        "FOAM FINGER", "OVERTIME", "TROPHY", "CHAMPIONS", "PLAYOFFS",
    ]),
    "valentines": ("Valentine's Day", [
        "LOVE LETTER", "LOVE NOTE", "CUPID'S ARROW", "CUPID", "RED ROSES",
        "BOX OF CHOCOLATES", "CANDY HEARTS", "SWEETHEART", "BE MINE", "LOVEBIRDS",
        "VALENTINE", "FIRST DATE", "DINNER DATE", "SECRET ADMIRER", "PUPPY LOVE",
        "HEART", "HEARTS", "ROMANCE", "BOUQUET", "CRUSH", "ADMIRER", "DARLING",
        "SWEETIE", "HONEY", "BELOVED", "XOXO", "HUGS", "KISSES", "LACE", "DOILY",
        "BOW", "ARROW", "CANDLELIT DINNER", "LOVE SONG", "ROSES", "POEM",
        "SONNET", "ADORE", "AMOR", "AMORE", "TRUE LOVE",
    ]),
    "presidents": ("Presidents' Day", [
        "WHITE HOUSE", "OVAL OFFICE", "MOUNT RUSHMORE", "LOG CABIN", "CHERRY TREE",
        "HONEST ABE", "GETTYSBURG", "INAUGURATION", "FIRST LADY", "STOVEPIPE HAT",
        "ROSE GARDEN", "AIR FORCE ONE", "CAMP DAVID", "CABINET", "VETO", "OATH",
        "LINCOLN", "WASHINGTON", "PENNY", "QUARTER", "MONUMENT", "MEMORIAL",
        "LIBRARY", "PORTRAIT", "SEAL", "EAGLE", "EXECUTIVE", "COMMANDER", "TERM",
        "PRESIDENT", "PRESIDENTS", "HISTORY",
    ]),
    "mardigras": ("Mardi Gras", [
        "FAT TUESDAY", "KING CAKE", "MASQUERADE", "PARADE FLOAT", "BRASS BAND",
        "NEW ORLEANS", "BOURBON STREET", "FRENCH QUARTER", "BEIGNETS", "GUMBO",
        "JAMBALAYA", "CRAWFISH", "CREOLE", "CAJUN", "JAZZ", "BEADS", "MASKS",
        "MASK", "KREWE", "CARNIVAL", "PARADE", "FLOAT", "PURPLE", "GOLD", "GREEN",
        "TRUMPET", "TUBA", "FEATHERS", "SEQUINS", "DOUBLOONS", "FESTIVAL", "BAYOU",
        "LENT", "PANCAKES",
        "PARADES", "PRALINE", "REVELER", "JESTERS",
    ]),
    "stpatricks": ("St. Patrick's Day", [
        "POT OF GOLD", "FOUR LEAF CLOVER", "SHAMROCK", "LEPRECHAUN", "RAINBOW",
        "EMERALD ISLE", "IRISH STEW", "SODA BREAD", "CORNED BEEF", "CABBAGE",
        "BAGPIPES", "DUBLIN", "LUCK OF THE IRISH", "BLARNEY STONE", "IRISH JIG",
        "STEP DANCING", "FIDDLE", "CELTIC", "ERIN", "IRELAND", "EIRE", "GREEN",
        "EMERALD", "CLOVER", "LUCK", "LUCKY", "JIG", "REEL", "HARP", "TIN WHISTLE",
        "PARADE", "MARCH", "GOLD", "COINS", "KILT", "TARTAN", "LIMERICK", "CORK",
        "GALWAY", "SHILLELAGH",
    ]),
    "spring": ("Spring Fever", [
        "APRIL SHOWERS", "MAY FLOWERS", "CHERRY BLOSSOMS", "SPRING CLEANING",
        "DAYLIGHT SAVING", "SPRING FORWARD", "TULIPS", "DAFFODILS", "CROCUS",
        "ROBINS", "BIRDSONG", "RAIN BOOTS", "UMBRELLA", "KITE FLYING", "KITES",
        "PUDDLES", "EQUINOX", "BUDS", "BLOOM", "BLOSSOM", "SPROUT", "SEEDLING",
        "GREEN GRASS", "LAMBS", "BABY CHICKS", "NEST", "EGGS", "RAINBOW",
        "DRIZZLE", "SHOWERS", "MEADOW", "VIOLETS", "LILAC", "IRIS", "MARCH",
        "APRIL", "MAY", "FRESH AIR", "OPEN WINDOWS",
    ]),
    "easter": ("Easter", [
        "EGG HUNT", "EASTER BUNNY", "EASTER BASKET", "EASTER EGGS", "JELLY BEANS",
        "CHOCOLATE BUNNY", "HOT CROSS BUNS", "DEVILED EGGS", "EGG DYE", "PASTELS",
        "BONNET", "EASTER BONNET", "LILIES", "SUNDAY BEST", "SPRING LAMB", "HAM",
        "BRUNCH", "BUNNY", "CHICKS", "BASKET", "GRASS", "EGGS", "HOP", "EARS",
        "CARROTS", "DYE", "HUNT", "SUNRISE SERVICE", "PARADE", "TULIP", "SPRING",
        "BASKETS", "BONNETS", "SUNRISE",
    ]),
    "basketball": ("Hoops", [
        "SLAM DUNK", "FREE THROW", "THREE POINTER", "JUMP SHOT", "LAYUP", "REBOUND",
        "FULL COURT PRESS", "BRACKET", "FINAL FOUR", "SWEET SIXTEEN", "ELITE EIGHT",
        "CINDERELLA", "BUZZER BEATER", "HOOPS", "HOOP", "BACKBOARD", "DRIBBLE",
        "ASSIST", "ALLEY OOP", "FOUL LINE", "TIP OFF", "NET", "RIM", "COURT",
        "POINT GUARD", "CENTER", "FORWARD", "SHOT CLOCK", "TIMEOUT", "UPSET",
        "UNDERDOG", "SEED", "MADNESS", "DUNK", "SWISH", "BALL", "PASS", "STEAL",
        "BLOCK", "SCORE", "TEAM",
    ]),
    "baseball": ("Opening Day", [
        "OPENING DAY", "HOME RUN", "GRAND SLAM", "SEVENTH INNING STRETCH",
        "PITCHER'S MOUND", "HOME PLATE", "DUGOUT", "BULLPEN", "STRIKEOUT",
        "CURVEBALL", "FASTBALL", "KNUCKLEBALL", "BALLPARK", "BLEACHERS",
        "PEANUTS", "CRACKER JACK", "HOT DOG", "SCOREBOARD", "SHORTSTOP",
        "OUTFIELD", "INFIELD", "BASES LOADED", "DOUBLE PLAY", "BASE HIT",
        "BATTING CAGE", "BATTER UP", "UMPIRE", "INNING", "BUNT", "BAT", "BALL",
        "GLOVE", "MITT", "BASE", "OUT", "RUN", "STRIKE", "SLIDE", "STEAL", "ERA",
        "RBI", "ACE", "CATCHER", "PITCHER", "SPRING TRAINING", "WORLD SERIES",
    ]),
    "earthday": ("Earth Day", [
        "RECYCLING", "RECYCLE", "SOLAR PANELS", "SOLAR POWER", "WIND FARM",
        "COMPOST", "COMPOST BIN", "TREE PLANTING", "PLANT A TREE", "REUSABLE BAG",
        "CLEAN WATER", "RAIN FOREST", "WILDLIFE", "ECOSYSTEM", "CONSERVATION",
        "GO GREEN", "ORGANIC", "BIKE LANE", "CARPOOL", "NATURE", "PLANET",
        "EARTH", "OCEAN", "FOREST", "TREES", "OAK", "SEEDS", "SOIL", "BEES",
        "HABITAT", "ECO", "GREEN", "REUSE", "REDUCE", "LITTER", "CLEANUP",
        "NATIONAL PARK", "MOTHER NATURE", "BLUE PLANET",
    ]),
    "mothersday": ("Mother's Day", [
        "BREAKFAST IN BED", "HANDMADE CARD", "FLOWERS", "BOUQUET", "CORSAGE",
        "CARNATIONS", "BRUNCH", "MOM", "MOMS", "MOMMY", "MAMA", "MOTHER",
        "MOTHER HEN", "GRANDMA", "NANA", "GRANNY", "HUGS", "THANK YOU",
        "FAMILY", "SPA DAY", "BATH SALTS", "PERFUME", "LOCKET", "TEA PARTY",
        "MIMOSA", "PANCAKES", "ROSES", "PICNIC", "LOVE", "APRON", "RECIPE",
    ]),
    # ---- Summer and fall ----
    "summer": ("Summer Days", [
        "BEACH TOWEL", "SAND CASTLE", "SUNSCREEN", "ICE CREAM TRUCK",
        "LEMONADE STAND", "POOL PARTY", "SUMMER CAMP", "FLIP FLOPS", "SUNGLASSES",
        "BARBECUE", "PICNIC", "PICNIC BLANKET", "HAMMOCK", "FIREFLIES",
        "WATERMELON", "SPRINKLER", "ROAD TRIP", "CAMPFIRE", "SWIMSUIT",
        "BEACH BALL", "BEACH UMBRELLA", "SEASHELLS", "BOARDWALK", "POPSICLE",
        "SNOW CONE", "HEAT WAVE", "SUNBURN", "SUNSHINE", "SUMMER VACATION",
        "SURF", "WAVES", "TAN", "SUN", "HOT", "SAND", "LAKE", "DOCK", "CANOE",
        "SWIM", "POOL", "JULY", "AUGUST", "SOLSTICE",
        "SANDALS", "PICNICS", "SEASIDE", "SURFERS",
    ]),
    "fourth": ("Independence Day", [
        "FIREWORKS", "SPARKLERS", "STARS AND STRIPES", "OLD GLORY", "LIBERTY BELL",
        "BLOCK PARTY", "HOT DOGS", "HAMBURGERS", "INDEPENDENCE", "UNCLE SAM",
        "YANKEE DOODLE", "APPLE PIE", "PARADE", "FLAG", "FLAGS", "BUNTING",
        "PICNIC", "COOKOUT", "BACKYARD", "GRILL", "STARS", "STRIPES", "RED",
        "WHITE", "BLUE", "BANG", "BOOM", "POP", "LIBERTY", "FREEDOM",
        "DECLARATION", "PHILADELPHIA", "SEVENTEEN SEVENTY SIX", "JULY",
        "MARCHING BAND", "LAWN CHAIRS", "CORN ON THE COB",
    ]),
    "school": ("Back to School", [
        "SCHOOL BUS", "LUNCH BOX", "PENCIL CASE", "BACKPACK", "HOMEROOM",
        "RECESS", "FIELD TRIP", "REPORT CARD", "SPELLING BEE", "HALL PASS",
        "LOCKER", "CHALKBOARD", "WHITEBOARD", "CLASSROOM", "TEACHER", "PRINCIPAL",
        "HOMEWORK", "POP QUIZ", "GOLD STAR", "SHOW AND TELL", "STUDY HALL",
        "SCIENCE FAIR", "BOOK REPORT", "PENCIL", "ERASER", "CRAYONS", "RULER",
        "GLUE STICK", "BINDER", "NOTEBOOK", "TEXTBOOK", "DESK", "BELL", "EXAM",
        "TEST", "GRADE", "CLASS", "LESSON", "ABC", "ABCS", "ALGEBRA", "ESSAY",
        "SEMESTER", "CAFETERIA", "GYM CLASS", "PLAYGROUND",
    ]),
    "autumn": ("Fall Colors", [
        "FALL FOLIAGE", "APPLE PICKING", "APPLE CIDER", "PUMPKIN PATCH",
        "PUMPKIN SPICE", "HARVEST MOON", "HAYRIDE", "CORN MAZE", "SCARECROW",
        "LEAF PILE", "RAKE", "ACORNS", "ACORN", "SQUIRREL", "SWEATER WEATHER",
        "FLANNEL", "BONFIRE", "CARAMEL APPLE", "CIDER", "GOURDS", "HARVEST",
        "MAPLE", "OAK", "LEAVES", "AMBER", "RUSSET", "CRISP", "OCTOBER",
        "NOVEMBER", "SEPTEMBER", "EQUINOX", "AUTUMN", "FALL",
    ]),
    "halloween": ("Halloween", [
        "TRICK OR TREAT", "JACK O LANTERN", "HAUNTED HOUSE", "CANDY CORN",
        "COSTUME PARTY", "BLACK CAT", "WITCH'S HAT", "BROOMSTICK", "CAULDRON",
        "SKELETON", "MUMMY", "GHOST", "GHOSTS", "GOBLIN", "VAMPIRE", "WEREWOLF",
        "SCARECROW", "PUMPKIN", "COBWEB", "SPIDER WEB", "BATS", "BAT", "OWL",
        "MOON", "FULL MOON", "SPOOKY", "EERIE", "BOO", "EEK", "HOWL", "CAPE",
        "MASK", "WITCH", "WAND", "SPELL", "POTION", "COSTUME", "CANDY", "TREAT",
        "TREATS", "GHOUL", "CRYPT", "TOMBSTONE", "COFFIN", "OCTOBER",
    ]),
    # ---- Any time ----
    "ocean": ("Ocean Life", [
        "CORAL REEF", "SEA TURTLE", "BLUE WHALE", "KILLER WHALE", "SEA HORSE",
        "STARFISH", "JELLYFISH", "SEA OTTER", "SEA LION", "HERMIT CRAB",
        "OCTOPUS", "SQUID", "SHARK", "DOLPHIN", "WHALE", "SEAL", "EEL", "RAY",
        "CLAM", "OYSTER", "PEARL", "KELP", "SEAWEED", "TIDE", "TIDE POOL",
        "LOW TIDE", "HIGH TIDE", "WAVE", "SURF", "SHORE", "REEF", "LAGOON",
        "ANCHOR", "SAILOR", "SUBMARINE", "SCUBA", "SNORKEL", "DEEP SEA", "ABYSS",
    ]),
    "space": ("Outer Space", [
        "OUTER SPACE", "SOLAR SYSTEM", "MILKY WAY", "BLACK HOLE", "SHOOTING STAR",
        "LIGHT YEAR", "SPACE STATION", "SPACESHIP", "ROCKET", "LAUNCH PAD",
        "COUNTDOWN", "BLAST OFF", "LIFTOFF", "ASTRONAUT", "MOON LANDING",
        "MOON", "SUN", "STAR", "STARS", "PLANET", "COMET", "METEOR", "ORBIT",
        "GALAXY", "NEBULA", "SATURN", "MARS", "VENUS", "EARTH", "PLUTO",
        "JUPITER", "MERCURY", "URANUS", "NEPTUNE", "ALIEN", "UFO", "ROVER",
        "CRATER", "ECLIPSE", "TELESCOPE", "COSMOS", "ZERO GRAVITY",
    ]),
    "weather": ("Weather Report", [
        "WEATHER REPORT", "FORECAST", "THUNDERSTORM", "LIGHTNING", "THUNDER",
        "RAINBOW", "TORNADO", "HURRICANE", "HEAT WAVE", "COLD FRONT", "WARM FRONT",
        "HUMIDITY", "BAROMETER", "WEATHER VANE", "DOPPLER RADAR", "HAIL", "RAIN",
        "SNOW", "SLEET", "FOG", "MIST", "DEW", "WIND", "GUST", "BREEZE", "GALE",
        "STORM", "CLOUD", "CLOUDS", "SUNNY", "CLOUDY", "RAINY", "WINDY",
        "DRIZZLE", "DOWNPOUR", "MONSOON", "SUNSHINE", "PARTLY CLOUDY",
    ]),
    "camping": ("Into the Woods", [
        "CAMPFIRE", "SLEEPING BAG", "TENT", "TENT STAKES", "S'MORES",
        "MARSHMALLOWS", "HIKING BOOTS", "HIKING TRAIL", "TRAIL MIX", "COMPASS",
        "LANTERN", "FLASHLIGHT", "CANTEEN", "BACKPACK", "BUG SPRAY", "CAMPSITE",
        "LOG CABIN", "FISHING ROD", "CANOE", "KAYAK", "PADDLE", "LAKE", "RIVER",
        "CREEK", "WOODS", "FOREST", "PINE", "PINECONE", "OWL", "BEAR", "DEER",
        "MOOSE", "ELK", "TRAIL", "MAP", "ROPE", "AXE", "LOG", "LOGS", "EMBERS",
        "GHOST STORIES", "STARGAZING", "NATIONAL PARK", "CAMPER",
        "BONFIRE", "CAMPERS", "PADDLES",
    ]),
    "kitchen": ("What's Cooking", [
        "ROLLING PIN", "CUTTING BOARD", "MIXING BOWL", "MEASURING CUP",
        "WOODEN SPOON", "FRYING PAN", "CAST IRON", "SLOW COOKER", "OVEN MITT",
        "COOKBOOK", "RECIPE", "SPATULA", "WHISK", "LADLE", "TONGS", "COLANDER",
        "GRATER", "PEELER", "SKILLET", "KETTLE", "TOASTER", "BLENDER", "OVEN",
        "STOVE", "SAUCEPAN", "POT", "PAN", "WOK", "APRON", "CHEF", "SOUS CHEF",
        "BAKE", "BOIL", "SIMMER", "SAUTE", "ROAST", "BROIL", "STIR", "DICE",
        "MINCE", "CHOP", "SEAR", "STEW", "PINCH OF SALT", "TASTE TEST",
    ]),
    "pets": ("Pet Shop", [
        "GOLDFISH", "HAMSTER", "GUINEA PIG", "PARAKEET", "PUPPY", "KITTEN",
        "CAT", "DOG", "PUP", "KITTY", "TABBY", "COLLIE", "BEAGLE", "POODLE",
        "TERRIER", "RETRIEVER", "DOG BOWL", "DOG HOUSE", "DOG PARK", "LEASH",
        "COLLAR", "LITTER BOX", "SCRATCHING POST", "CHEW TOY", "TENNIS BALL",
        "FISH TANK", "BIRDCAGE", "TREAT", "TREATS", "WALK", "FETCH", "SIT",
        "STAY", "ROLL OVER", "SHAKE", "BARK", "MEOW", "PURR", "WOOF", "ARF",
        "VET", "PAW", "PAWS", "WHISKERS", "TAIL", "ADOPT", "RESCUE",
    ]),
    "travel": ("Bon Voyage", [
        "PASSPORT", "BOARDING PASS", "CARRY ON", "SUITCASE", "LUGGAGE",
        "BAGGAGE CLAIM", "JET LAG", "WINDOW SEAT", "AISLE SEAT", "LAYOVER",
        "RED EYE", "TRAVEL AGENT", "ROAD MAP", "GUIDEBOOK", "POSTCARD",
        "SOUVENIR", "HOTEL", "MOTEL", "INN", "HOSTEL", "RESORT", "CRUISE",
        "CRUISE SHIP", "AIRPORT", "TRAIN STATION", "GATE", "TICKET", "VISA",
        "TOUR", "TOURIST", "TOUR GUIDE", "ITINERARY", "SIGHTSEEING", "TRIP",
        "TREK", "VOYAGE", "JOURNEY", "ABROAD", "FLIGHT", "PILOT", "TAXI",
    ]),
    "music": ("Music Hall", [
        "SHEET MUSIC", "GRAND PIANO", "BASS GUITAR", "DRUM KIT", "DRUM ROLL",
        "STRING QUARTET", "BRASS SECTION", "CONDUCTOR", "BATON", "ORCHESTRA",
        "SYMPHONY", "CONCERTO", "OPERA", "ARIA", "CHOIR", "CHORUS", "SOLO",
        "DUET", "TRIO", "QUARTET", "PIANO", "VIOLIN", "CELLO", "VIOLA", "HARP",
        "FLUTE", "OBOE", "TUBA", "TRUMPET", "TROMBONE", "BANJO", "UKULELE",
        "CLARINET", "SAXOPHONE", "TEMPO", "RHYTHM", "MELODY", "HARMONY", "NOTE",
        "NOTES", "CHORD", "SCALE", "KEY", "ENCORE", "OVERTURE", "ROCK BAND",
        "JAZZ", "BLUES", "STAGE", "TOUR", "ALBUM", "SONG",
    ]),
    "farm": ("Down on the Farm", [
        "RED BARN", "BARNYARD", "HAYLOFT", "HAY BALE", "SILO", "TRACTOR",
        "PITCHFORK", "SCARECROW", "CORNFIELD", "PIGPEN", "HEN HOUSE", "CHICKEN COOP",
        "FARMHOUSE", "FARMERS MARKET", "PICKUP TRUCK", "WEATHER VANE", "ROOSTER",
        "HEN", "HENS", "CHICK", "COW", "COWS", "CALF", "PIG", "PIGLET", "SHEEP",
        "LAMB", "EWE", "GOAT", "HORSE", "PONY", "DUCK", "GOOSE", "MOO", "OINK",
        "BAA", "NEIGH", "CLUCK", "EGGS", "MILK", "HAY", "CORN", "WHEAT", "OATS",
        "PLOW", "FIELD", "ACRE", "ACRES", "HARVEST",
    ]),
    "birds": ("Birdwatching", [
        "BIRDWATCHING", "BIRDHOUSE", "BIRD FEEDER", "BIRDBATH", "BIRDSONG",
        "BINOCULARS", "FIELD GUIDE", "BALD EAGLE", "BLUE JAY", "CARDINAL",
        "ROBIN", "SPARROW", "FINCH", "WREN", "OWL", "HAWK", "EAGLE", "CROW",
        "RAVEN", "DOVE", "PIGEON", "GULL", "HERON", "EGRET", "CRANE", "STORK",
        "SWAN", "GOOSE", "DUCK", "LOON", "PELICAN", "PARROT", "TOUCAN",
        "FLAMINGO", "PENGUIN", "OSTRICH", "EMU", "HUMMINGBIRD", "WOODPECKER",
        "NEST", "EGG", "WING", "WINGS", "BEAK", "FEATHER", "TALON", "FLOCK",
        "MIGRATION",
    ]),
    "garden": ("In the Garden", [
        "FLOWER BED", "GARDEN HOSE", "WATERING CAN", "WHEELBARROW", "GREENHOUSE",
        "VEGETABLE PATCH", "COMPOST", "TROWEL", "RAKE", "HOE", "SPADE", "SHOVEL",
        "SHEARS", "SEEDS", "SOIL", "MULCH", "WEEDS", "WEED", "SPROUT", "BLOOM",
        "PETAL", "PETALS", "STEM", "ROOT", "ROOTS", "LEAF", "VINE", "ROSE",
        "TULIP", "DAISY", "LILY", "IRIS", "PANSY", "ORCHID", "SUNFLOWER",
        "TOMATO", "PEAS", "BEANS", "LETTUCE", "CARROTS", "GNOME", "TRELLIS",
        "BIRDBATH", "BUTTERFLY", "BUMBLEBEE", "LADYBUG", "EARTHWORM",
    ]),
    "pirates": ("Pirates Ahoy", [
        "TREASURE MAP", "TREASURE CHEST", "BURIED TREASURE", "JOLLY ROGER",
        "PIRATE SHIP", "WALK THE PLANK", "CROW'S NEST", "EYE PATCH", "PEG LEG",
        "SKULL AND CROSSBONES", "DESERT ISLAND", "SEVEN SEAS", "SHIP AHOY",
        "AHOY", "ARR", "MATEY", "CAPTAIN", "FIRST MATE", "CREW", "DECK", "MAST",
        "SAIL", "SAILS", "PLANK", "ANCHOR", "CANNON", "CUTLASS", "SWORD",
        "PARROT", "GOLD", "DOUBLOONS", "LOOT", "MAP", "ISLAND", "SEA",
        "SHIP", "HOOK", "STARBOARD", "PORT", "BOW", "STERN", "HELM", "GALLEON",
        "SPYGLASS",
        "PARROTS", "PLUNDER", "SEA DOGS", "CORSAIR", "RIGGING",
    ]),
    "mystery": ("Whodunit", [
        "PRIVATE EYE", "MAGNIFYING GLASS", "FINGERPRINTS", "RED HERRING",
        "PLOT TWIST", "SECRET PASSAGE", "LOCKED ROOM", "MURDER MYSTERY",
        "DETECTIVE", "SLEUTH", "SUSPECT", "SUSPECTS", "WITNESS", "ALIBI", "CLUE",
        "CLUES", "MOTIVE", "EVIDENCE", "CASE", "CASE CLOSED", "WHODUNIT",
        "BUTLER", "INSPECTOR", "SHERLOCK", "WATSON", "POIROT", "HUNCH",
        "DEDUCE", "DEDUCTION", "TRAIL", "TRACK", "SPY", "AGENT", "CODE",
        "CIPHER", "RIDDLE", "PUZZLE", "SECRET", "HIDDEN", "NOIR", "TRENCH COAT",
        "CULPRIT", "MYSTERY", "GUMSHOE", "SLEUTHS",
    ]),
    "fairytales": ("Once Upon a Time", [
        "ONCE UPON A TIME", "HAPPILY EVER AFTER", "FAIRY GODMOTHER", "GLASS SLIPPER",
        "MAGIC WAND", "MAGIC MIRROR", "PUMPKIN COACH", "GINGERBREAD HOUSE",
        "BIG BAD WOLF", "THREE BEARS", "THREE LITTLE PIGS", "BEANSTALK",
        "SLEEPING BEAUTY", "SNOW WHITE", "CINDERELLA", "RAPUNZEL", "PRINCESS",
        "PRINCE", "PRINCE CHARMING", "KING", "QUEEN", "CASTLE", "TOWER", "MOAT",
        "DRAGON", "KNIGHT", "WITCH", "OGRE", "TROLL", "GIANT", "ELF", "ELVES",
        "FAIRY", "SPELL", "CURSE", "WISH", "WAND", "FROG", "TIARA", "CROWN",
        "THRONE", "KINGDOM", "LEGEND", "FABLE", "MYTH",
        "DRAGONS", "WIZARDS", "MERMAID", "UNICORN", "BEDTIME",
    ]),
    "dinosaurs": ("Dino Dig", [
        "DINOSAUR", "DINOSAURS", "TYRANNOSAURUS", "T REX", "TRICERATOPS",
        "STEGOSAURUS", "BRONTOSAURUS", "VELOCIRAPTOR", "PTERODACTYL", "RAPTOR",
        "FOSSIL", "FOSSILS", "BONES", "SKELETON", "SKULL", "AMBER", "DIG",
        "DIG SITE", "EXCAVATION", "PALEONTOLOGIST", "MUSEUM", "JURASSIC",
        "CRETACEOUS", "ICE AGE", "MAMMOTH", "WOOLLY MAMMOTH", "SABER TOOTH",
        "EXTINCT", "EXTINCTION", "METEOR", "VOLCANO", "TAR PITS", "ROAR",
        "CLAW", "CLAWS", "TAIL", "EGG", "NEST", "HERD", "ERA", "EON", "AGES",
    ]),
    "olympics": ("Going for Gold", [
        "GOLD MEDAL", "SILVER MEDAL", "BRONZE MEDAL", "OLYMPIC TORCH",
        "OPENING CEREMONY", "PODIUM", "ANTHEM", "RELAY RACE", "MARATHON",
        "SPRINT", "HURDLES", "LONG JUMP", "HIGH JUMP", "POLE VAULT", "JAVELIN",
        "DISCUS", "SHOT PUT", "DECATHLON", "GYMNASTICS", "BALANCE BEAM",
        "DIVING BOARD", "SWIMMING", "FENCING", "ARCHERY", "ROWING", "CYCLING",
        "WRESTLING", "JUDO", "BOXING", "TENNIS", "TRACK", "FIELD", "MEDAL",
        "GOLD", "SILVER", "BRONZE", "TORCH", "FLAME", "RINGS", "TEAM",
        "ATHLETE", "RECORD", "WORLD RECORD", "FINISH LINE", "START LINE",
    ]),
    "tea": ("Tea Time", [
        "TEA PARTY", "TEA TIME", "TEAPOT", "TEACUP", "TEA BAG", "TEA KETTLE",
        "TEA LEAVES", "AFTERNOON TEA", "HIGH TEA", "EARL GREY", "GREEN TEA",
        "BLACK TEA", "CHAI", "OOLONG", "MATCHA", "HERBAL", "CHAMOMILE",
        "PEPPERMINT", "LEMON", "HONEY", "MILK", "SUGAR", "SUGAR CUBES",
        "SCONES", "CLOTTED CREAM", "CRUMPETS", "FINGER SANDWICHES", "SAUCER",
        "STEEP", "BREW", "SIP", "CUP", "POT", "CUPPA", "COSY", "TEA COSY",
        "BISCUITS", "CAKE", "JAM",
        "BISCUIT", "STEEPED", "DARJEELING",
    ]),
    "pizza": ("Pizza Night", [
        "PIZZA PARTY", "PIZZA OVEN", "PIZZA CUTTER", "DEEP DISH", "THIN CRUST",
        "STUFFED CRUST", "EXTRA CHEESE", "PEPPERONI", "MUSHROOMS", "OLIVES",
        "ONIONS", "PEPPERS", "SAUSAGE", "ANCHOVIES", "PINEAPPLE", "BASIL",
        "OREGANO", "MOZZARELLA", "PARMESAN", "TOMATO SAUCE", "DOUGH", "CRUST",
        "SLICE", "SLICES", "PIE", "PIES", "CHEESE", "SAUCE", "TOPPINGS",
        "DELIVERY", "TAKEOUT", "NAPLES", "CALZONE", "GARLIC KNOTS", "BOX",
    ]),
    "circus": ("Under the Big Top", [
        "BIG TOP", "RINGMASTER", "TRAPEZE", "TIGHTROPE", "HIGH WIRE", "SAFETY NET",
        "CLOWN CAR", "CLOWN", "CLOWNS", "JUGGLER", "JUGGLING", "ACROBAT",
        "ACROBATS", "UNICYCLE", "STILTS", "COTTON CANDY", "POPCORN", "PEANUTS",
        "CANNON", "HUMAN CANNONBALL", "TENT", "RING", "RINGS", "LIONS", "TAMER",
        "SPOTLIGHT", "DRUMROLL", "STUNT", "STUNTS", "BALANCE", "TUMBLE", "SHOW",
        "SHOWTIME", "TICKET", "MIDWAY", "CARNIVAL", "SIDESHOW", "MAGICIAN",
    ]),
    "movies": ("At the Movies", [
        "MOVIE STAR", "MOVIE THEATER", "BOX OFFICE", "RED CARPET", "SILVER SCREEN",
        "SPECIAL EFFECTS", "OPENING NIGHT", "SNEAK PREVIEW", "PLOT TWIST",
        "HAPPY ENDING", "CLIFFHANGER", "SEQUEL", "PREQUEL", "REMAKE", "TRAILER",
        "SCRIPT", "SCENE", "SET", "TAKE", "CUT", "ACTION", "DIRECTOR", "ACTOR",
        "ACTRESS", "EXTRA", "STAR", "ROLE", "LEAD", "CAMEO", "OSCAR", "AWARD",
        "POPCORN", "TICKET", "SCREEN", "REEL", "FILM", "CREDITS", "STUNT",
        "MATINEE", "DRIVE IN", "COMEDY", "DRAMA", "WESTERN",
    ]),
    "beach": ("Beach Day", [
        "BEACH TOWEL", "BEACH BALL", "BEACH CHAIR", "BEACH UMBRELLA", "SAND CASTLE",
        "SAND DOLLAR", "SEASHELL", "SEASHELLS", "SUNSCREEN", "SUN HAT",
        "SUNGLASSES", "SURFBOARD", "BOOGIE BOARD", "LIFEGUARD", "LIGHTHOUSE",
        "BOARDWALK", "PIER", "DUNES", "SAND", "SURF", "WAVES", "TIDE", "SHORE",
        "COAST", "BAY", "COVE", "GULL", "CRAB", "SHELL", "SWIM", "TAN", "SUN",
        "BIKINI", "FLIP FLOPS", "COOLER", "PAIL", "SHOVEL", "KITE",
        "SEAGULL", "SANDBAR", "SEASIDE", "SURFERS",
    ]),
    "chess": ("Game of Kings", [
        "CHESSBOARD", "CHECKMATE", "STALEMATE", "OPENING MOVE", "END GAME",
        "GRANDMASTER", "TOURNAMENT", "CHESS CLOCK", "KING", "QUEEN", "ROOK",
        "BISHOP", "KNIGHT", "PAWN", "PAWNS", "CASTLE", "CHECK", "MATE", "MOVE",
        "GAMBIT", "SQUARE", "SQUARES", "RANK", "FILE", "DRAW", "RESIGN",
        "BLACK", "WHITE", "BOARD", "PIECE", "PIECES", "TACTIC", "STRATEGY",
        "RATING", "MASTER", "RIVAL", "MATCH",
        "KNIGHTS", "BISHOPS", "OPENING",
    ]),
}


def all_entries():
    out = set()
    for _, entries in TOPICS.values():
        out.update(lib.clean(e) for e in entries)
    return out


def bonus_words(topic):
    """Words of a topic, cleaned, for daily.py's fill bonus."""
    return {lib.clean(e) for e in TOPICS[topic][1]}


def cmd_list():
    clued = lib.load_clues()
    total = set()
    for slug, (title, entries) in TOPICS.items():
        words = {lib.clean(e) for e in entries}
        total |= words
        have = sum(w in clued for w in words)
        print(f"{slug:14} {title:22} {len(words):3} entries, {have:3} clued")
    print(f"{len(total)} distinct entries across {len(TOPICS)} topics")


def cmd_missing(slugs):
    clued = lib.load_clues()
    seen = set()
    for slug in slugs or TOPICS:
        for e in TOPICS[slug][1]:
            w = lib.clean(e)
            if w not in clued and w not in seen:
                seen.add(w)
                print(e)
    print(f"# {len(seen)} entries need clues", file=sys.stderr)


def _stems(entry):
    out = set()
    for part in entry.split():
        w = lib.clean(part)
        for end in ("ERS", "ER", "ES", "S", "ING"):
            if w.endswith(end) and len(w) - len(end) >= 3:
                w = w[: -len(end)]
                break
        out.add(w)
    return out


def cmd_themes(slug, n=12):
    """Theme sets that fit a 15x15 grid: two answers of the same length in
    mirrored rows, plus an odd-length centre answer that leaves room for a
    block of 4+ squares on each side. Prints pairs, each with a few centres."""
    title, entries = TOPICS[slug]
    clued = lib.load_clues()
    by_len = {}
    for e in entries:
        w = lib.clean(e)
        if w in clued and (len(e.split()) > 1 or len(w) >= 7):
            by_len.setdefault(len(w), []).append(e)
    centres = [e for L, es in by_len.items() for e in es if L == 7]  # 5s and 9s haven't filled
    pairs = []
    for L, es in by_len.items():
        if L in PAIR_LENGTHS and L >= 8:
            pairs += [(a, b) for a, b in itertools.combinations(es, 2) if not _stems(a) & _stems(b)]
    rng = random.Random(slug)
    rng.shuffle(pairs)
    # 10/10/7 and 11/11/7 fill most reliably; 9s and 13-14s are fine too.
    pairs.sort(key=lambda p: (len(lib.clean(p[0])) not in (10, 11), p[0].count(" ") + p[1].count(" ") == 0))
    print(f"{title}: {len(pairs)} pairs, {len(centres)} centre answers (7 letters)")
    for a, b in pairs[:n]:
        cs = [c for c in centres if not (_stems(c) & (_stems(a) | _stems(b)))]
        rng.shuffle(cs)
        print(f'  "{a}", "{b}"  ({len(lib.clean(a))})  centre: {", ".join(cs[:5]) or "none"}')


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] not in ("list", "missing", "themes"):
        sys.exit(__doc__)
    if args[0] == "list":
        cmd_list()
    elif args[0] == "missing":
        cmd_missing(args[1:])
    else:
        if len(args) < 2 or args[1] not in TOPICS:
            sys.exit(f"topics: {', '.join(TOPICS)}")
        cmd_themes(args[1], int(args[2]) if len(args) > 2 else 12)

# Daily crossword themes, by date. Each theme has a title and 2-4 theme
# answers placed in mirror-image rows: the first two must be the same length,
# a third (centre row) must be odd, a fourth must match the third.
# Lengths that fit a 15x15 grid: 3-11, 13, 14 or 15 (15s are hard to fill).
# Write answers with spaces between words; that sets the (4,5) enumeration.
# An optional third item names a topic from topics.py; the filler then leans
# toward that topic's words. `python3 topics.py themes <topic>` suggests sets.

DAILY = {
    "2026-11-26": ("Kitchen Duty", ["ROLLING PIN", "DISHWASHER", "SPATULA"]),
    "2026-11-27": ("Black Friday", ["PARKING LOT", "SALES CLERK", "BARGAIN"]),
    "2026-11-28": ("Snow Day", ["SNOW ANGELS", "ICE SKATING", "SNOWMAN"]),
    "2026-11-29": ("Game Night", ["BOARD GAMES", "CARD TABLES", "PUZZLES"]),
    "2026-11-30": ("Under the Sea", ["CORAL REEFS", "SEA TURTLES", "OCTOPUS"]),
    "2026-12-01": ("Road Trip", ["SPEED LIMIT", "GAS STATION", "DETOURS"]),
    "2026-12-02": ("Coffee Break", ["FRENCH PRESS", "COFFEE BEANS", "BARISTA"]),
    "2026-12-03": ("Movie Night", ["MOVIE STARS", "PLOT TWISTS", "POPCORN"]),
    "2026-12-04": ("Festival of Lights", ["EIGHT NIGHTS", "JELLY DONUTS", "MENORAH"]),
    "2026-12-05": ("Space Walk", ["ASTRONAUTS", "SPACESUITS", "ORBITER"]),
    "2026-12-06": ("Music Lesson", ["SHEET MUSIC", "GUITAR PICK", "RECITAL"]),
    "2026-12-07": ("Bakery Run", ["BAGUETTES", "SOURDOUGH", "MUFFINS"]),
    "2026-12-08": ("Science Fair", ["LAB REPORTS", "HYPOTHESIS", "MAGNETS"]),
    "2026-12-09": ("Bundle Up", ["WOOL SWEATER", "SPACE HEATER", "MITTENS"]),
    "2026-12-10": ("At the Zoo", ["ZOOKEEPERS", "POLAR BEARS", "PENGUIN"]),
    "2026-12-11": ("Garden Party", ["FLOWER BEDS", "GARDEN HOSE", "PETUNIA"]),
    "2026-12-12": ("Baking Season", ["GINGERBREAD", "CANDLELIGHT", "WREATHS"]),
    "2026-12-13": ("On the Ice", ["FIGURE EIGHT", "HOCKEY STICK", "SKATERS"]),
    "2026-12-14": ("Season's Greetings", ["GREETINGS", "ENVELOPES", "MAILBOX"]),
    "2026-12-15": ("Trimming the Tree", ["CANDY CANES", "TREE SKIRTS", "BAUBLES"]),
    "2026-12-16": ("Winter Games", ["SNOWBOARDS", "SKI JUMPING", "BOBSLED"]),
    "2026-12-17": ("Cookie Swap", ["SHORTBREAD", "PEPPERMINT", "COOKIES"]),
    "2026-12-18": ("Night Sky", ["NORTH STAR", "BIG DIPPER", "ECLIPSE"]),
    "2026-12-19": ("Sweet Shop", ["CHOCOLATES", "JAWBREAKER", "TOFFEES"]),
    "2026-12-20": ("Snow Removal", ["SNOW SHOVEL", "SALT TRUCKS", "PLOWING"]),
    "2026-12-21": ("First Day of Winter", ["SHORTEST DAY", "WINTER COATS", "ICICLES"]),
    "2026-12-22": ("Holiday Baking", ["MINCE PIES", "FRUITCAKE", "STOLLEN"]),
    "2026-12-23": ("Last-Minute Gifts", ["GIFT CARDS", "WISH LISTS", "RECEIPT"]),
    "2026-12-24": ("Christmas Eve", ["SANTA CLAUS", "SLEIGH RIDE", "RUDOLPH"]),
    "2026-12-25": ("Merry Christmas", ["MISTLETOE", "STOCKINGS", "PRESENT"]),
    "2026-12-26": ("The Day After", ["RETURN LINES", "GIFT RECEIPT", "PAJAMAS"]),
    "2026-12-27": ("Book Nook", ["BOOKMARKS", "PAPERBACK", "LIBRARY"]),
    "2026-12-28": ("Puzzle Day", ["WORD SEARCH", "CROSSWORDS", "RIDDLES"]),
    "2026-12-29": ("Resolutions", ["GOAL SETTING", "FRESH STARTS", "JOURNAL"]),
    "2026-12-30": ("Keepsakes", ["SNOW GLOBES", "MUSIC BOXES", "TRINKET"]),
    "2026-12-31": ("New Year's Eve", ["TIMES SQUARE", "NOISEMAKERS", "NEW YEAR"]),
    "2027-01-01": ("New Year's Day", ["CLEAN SLATE", "RESOLUTION", "NEW LEAF"], "newyear"),
}

# Special events: one-off newspaper-style puzzles, built with event.py.
# size: 15 (daily size) or 21 (Sunday size). vocab: a word-list module whose
# WORDS the filler strongly prefers, so the fill leans into the event's theme.
# rev: bump when a published event gets a new grid, so old saved progress
# (for the old grid) isn't applied to the new one.
EVENTS = {
    "thanksgiving": {
        "title": "The Big Thanksgiving Crossword",
        "blurb": "A Sunday-size grid packed with the food, the history and the traditions of the holiday.",
        "date": "2026-11-26",
        "size": 21,
        "theme": ["MASHED POTATOES", "CRANBERRY SAUCE"],
        "vocab": "thanksgiving",
        "rev": 2,
    },
}

/* Prototype of an MatchDay */
exports.MatchDay = {
    init: function (leagueid, matchDay, homeTeam, awayTeam, homeScore, awayScore) {
        this.MatchDay = matchDay;
        this.HomeScore = homeScore;
        this.AwayScore = awayScore;
        this.HomeTeam = homeTeam;
        this.AwayTeam = awayTeam;
        this.updateDate = null;
        this.LeagueID = leagueid;

        return this;
    }
};

/* Helper function to create an MatchDay object */
exports.create = function (leagueid, matchDay, homeTeam, awayTeam, homeScore, awayScore) {
    return Object.create(exports.MatchDay).init(leagueid, matchDay, homeTeam, awayTeam, homeScore, awayScore);
};
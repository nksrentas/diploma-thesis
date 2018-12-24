import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getSummonerInfo(userId: String!): SummonerData!
    getVisionScore(userId: String!): [VisionScore]
    getKDAPerGame(userId: String!): [KDA]
    getWinRatio(userId: String!): Float
  }

  extend type Mutation {
    updateSummonerInfo(summonerName: String!, server: String!): Boolean
  }

  type Summoner {
    accountId: Float
    id: Float
    profileIconId: Int
    summonerLevel: Float
    name: String
  }

  type VisionScore {
    type: String
    value: Int
    gameCounter: Int
  }

  type KDA {
    kda: Float
    gameCounter: Int
  }
`;

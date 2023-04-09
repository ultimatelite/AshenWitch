const ytsr = require("ytsr");
const axios = require("axios").default;

/**
 * 
 * @param {String} desc 
 */
function clearDescription(desc){
  const pat = /\<\/?\w+\/?\>/gi;
  const nstr = desc.replace(pat, "");
  nstr.trim();
  return nstr;
}

function searchVideo(link, numberOfRequest=1){
    return new Promise(async (resolve)=>{
        const result = await ytsr(link);
        let instances = [];
        const numberFetched = result.results;
        if(numberFetched < numberOfRequest){
            for(let i = 0; i < numberFetched; i++){
                instances.push(result.items[i].url);
            }
            resolve(instances);
            return;
        }
        for(let i = 0; i < numberOfRequest; i++){
            instances.push(result.items[i].url);
        }
        resolve(instances);
    });
}

function requestAnime(query) {
    return new Promise(async (resolve, reject) => {
      const graphqlQuery = `
        query ($search: String) {
          Media(search: $search, type: ANIME) {
            id
            title {
              english
              romaji
              native
            }
            description(asHtml: false)
            format
            status
            season
            isAdult
            seasonYear
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            episodes
            duration
            chapters
            volumes
            countryOfOrigin
            isLicensed
            source
            averageScore
            meanScore
            favourites
            genres
            bannerImage
            coverImage {
              extraLarge
              large
              medium
              color
            }
            tags {
              id
              name
              description
            }
            relations {
              edges {
                node {
                  id
                  title {
                    english
                    romaji
                  }
                }
                relationType
              }
            }
            characters {
              edges {
                role
                node {
                  id
                  name {
                    full
                  }
                  image {
                    large
                  }
                }
              }
            }
          }
        }`;
  
      const variables = {
        search: query,
      };
  
      const options = {
        url: 'https://graphql.anilist.co',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          query: graphqlQuery,
          variables: variables,
        }),
      };
  
      try {
        const response = await axios(options);
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
}
function fetchAnime(query){
    return new Promise(async(resolve, reject)=>{
        let rawData = null;
        try{
            rawData = await requestAnime(query);
        }catch(e){
            reject(e);
            return;
        }
        const med = rawData.data.Media
        // process the json data and make it pretty 
        let chars = []
        const title = med.title
        const nsfw = med.isAdult ? "Yes" : "No"
        const url = "https://anilist.co/anime/"+med.id
        med.characters.edges.forEach(d=>{
          chars.push(d.node.name.full);
        })
        let tags = []
        med.tags.forEach(d=>tags.push(d.name))
        const desc = clearDescription(med.description)
        const mediaType = med.format.split("_").join(" ");
        const avgRating = med.averageScore
        const overallRating = med.meanScore
        const released = med.startDate.month + "/"+ med.startDate.day + "/"+ med.startDate.year
        const basedRaw = med.source
        const basedProcessArray = basedRaw.split("_");
        let based = "", basedFirst = true;

        for(let i of basedProcessArray){
            if(!basedFirst)based += " ";
            let getLowercase = i.toLowerCase();
            based += getLowercase.charAt(0).toUpperCase() + getLowercase.substring(1);
            basedFirst = false;
        }
        const chapters = med.chapters
        const duration = med.duration
        const type = med.type

        const seasonRaw = med.season.toLowerCase()
        const season = seasonRaw.charAt(0).toUpperCase() + seasonRaw.substring(1);

        const statusRaw = med.status.toLowerCase();
        const status = statusRaw.charAt(0).toUpperCase() + statusRaw.substring(1);
        const genres = med.genres

        const episodes = med.episodes
        const volumes = med.volumes
        const country = med.countryOfOrigin

        const cover = med.coverImage.medium
        const banner = med.bannerImage
        const favs = med.favourites

        const end = med.endDate.month + "/"+ med.endDate.day + "/"+ med.endDate.year
        const relationShips = []
        for(let i = 0; i < med.relations.edges.length; i++){
          const getRelation = med.relations.edges[i].relationType.toLowerCase();
          const formattedRelation = getRelation.charAt(0).toUpperCase() + getRelation.substring(1);
          relationShips.push(formattedRelation)
        }

        const response = {
          title: title,
          nsfw: nsfw,
          url: url,
          chars: chars,
          tags: tags,
          description: desc,
          avgRating: avgRating,
          overallRating: overallRating,
          released: released,
          based: based,
          chapters: chapters,
          duration: duration,
          type: type,
          status: status,
          genres: genres,
          episodes: episodes,
          volumes: volumes,
          country: country,
          cover: cover,
          banner: banner,
          favs: favs,
          end: end,
          season: season,
          relationTypes: relationShips,
          mediaType: mediaType
        }
        resolve(response)
    });
}
module.exports = {
    searchVideo,
    fetchAnime
};
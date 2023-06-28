var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, current) => {return total + current.likes},0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((biggest, current) => {
    if (biggest.likes >current.likes) {
      return biggest
    } else {
      return current
    }
  },0)

}

const mostBlogs = (blogs) => {
  // Reducella käydään läpi koko lista mutta authors onkin objekti jossa
  // jokaisella authorilla on oma kohta johon tallennetaan montako
  // kertaa se on tullut vastaan. Tähän ois varmasti olemassa joku
  // enemmän JS tyyppinen ratkaisu. Sitten käytetään lodashin orderBy
  // funktiota ja sillä järjestetään suuruusjärjestykseen, josta palautetaan
  // eka
  let blogCount = _.orderBy(blogs.reduce((authors,current) => {
    if (authors[current.author]) {
      authors[current.author].blogs++
    } else {
      authors[current.author] = {author: current.author,
        blogs: 1}
    }
    return authors
  }, {}), 'blogs', 'desc')

  return blogCount[0]
}

const mostLikes = (blogs) => {
  //Kuten mostblogs, mutta vielä vähän virtaviivaistetumpi versio
  return _.orderBy(blogs.reduce((authors,current) => {
    if (authors[current.author]) {
      authors[current.author].likes += current.likes
    } else {
      authors[current.author] = {author: current.author,
        likes: current.likes}
    }
    return authors
  }, {}), 'likes', 'desc')[0]
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
var mysql = require('mysql'),
  fs = require('fs');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'atlantic_archive'
});
connection.connect();

var queryString = `SELECT base_article.*, author.* 
FROM base_article 
JOIN base_article_authors ON base_article_authors.basearticle_id = base_article.id 
JOIN author ON author.id = base_article_authors.author_id 
WHERE base_article.content LIKE "%:</strong>%"
`

// Open connection
connection.query(queryString, function(err, res){
  if(err) throw err;

  // Grab entries with more than an arbitrary number of bolded colons
  res = res.filter(function(row){
    boldedColons = row.content.match(/<strong>(.*?)<\/strong>/g);
    if( !boldedColons )
      return false
    else return boldedColons.length >= 10 && boldedColons.length < 30
  })
  // Cut stories that have fewer than three question marks
  res = res.filter(function(row){
    var questionMarks = row.content.match(/\?/g);
    if(!questionMarks)
      return false
    else{
      return questionMarks.length >= 3;
    }
  })
  // Remove stuff without URLs
  res = res.filter(function(row){
    return row.original_url
  }) 
  // Remove stuff from partners
  res = res.filter(function(row){
    return row.content.indexOf(`This article is from the archive`) == -1 
      && row.original_url.indexOf('thewire.com') == -1 
      && row.original_url.indexOf('www.theatlanticwire.com') == -1
      && row.original_url.indexOf('www.theatlanticcities.com') == -1;
  }) 
  // And cut out Citylab
  res = res.filter(function(row){
    return row.original_url.indexOf(`citylab`) == -1;
  })
  // And cut out the Edge
  res = res.filter(function(row){
    return row.original_url.indexOf(`the-edge`) == -1;
  })
  // And cut out press releases
  res = res.filter(function(row){
    if( !row.original_url )
      return false 
    else
      return row.original_url.indexOf(`/personal/`) == -1 && row.original_url.indexOf(`/press-releases/`) == -1;
  })
  
  // Drop into a CSV and print
  fs.writeFileSync("output/output.csv", "title,url");
  res.forEach(function(row){
    fs.appendFileSync('output/output.csv', `"${row.title}",(${row.original_url})`)
    console.log(`${row.title} (${row.original_url})`)
  })
  connection.end();
})
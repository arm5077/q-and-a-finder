SELECT base_article.*, author.* 
FROM base_article 
JOIN base_article_authors ON base_article_authors.basearticle_id = base_article.id 
JOIN author ON author.id = base_article_authors.author_id 
WHERE base_article.content LIKE "%:</strong>%"


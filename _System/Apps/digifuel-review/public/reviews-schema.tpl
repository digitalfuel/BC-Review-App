{% if globals.get.productid -%}{% assign thisImage = {{smallImageUrl}} -%}{% else %}{% assign thisImage = {{image}} -%}{% endif %}
{% if globals.get.productid or catalogId -%}
<span itemscope itemtype="http://schema.org/Product">
	<meta itemprop="name" content="{{name}}">
	<meta itemprop="description" content="{{description | strip_html}}">
	<meta itemprop="image" content="http://www.{{globals.site.host}}{{thisImage}}">
		<span itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
		{% if {{reviewRating_length}} < 500 -%}
			<meta itemprop="ratingCount" content="{{reviewRating_length}}">
			<meta itemprop="ratingValue" content="{{reviewRating_rating|round:1|slice:-4,3}}"> 
			{% else %}
			<meta itemprop="ratingCount" content="{{reviewRating.totreviews}}">
			<meta itemprop="ratingValue" content="{{reviewRating.avgrating}}">
			{% endif %}
		</span>
</span>
{% endif %}
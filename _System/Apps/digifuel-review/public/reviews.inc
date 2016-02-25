{% capture Review_Name -%}Review - {{ Review | split: "-" | first}}{% endcapture %}
{% comment -%}{% capture Review_Name -%}Review - {{Review}}{% endcapture %}{% endcomment %}
{module_webapps id="{{Review_Name}}" filter="all" sortType="date" collection="reviews" template=""}
{% assign origID = globals.cookie.dfBCReview | split: "-" | first -%}
{% assign origName = globals.cookie.dfBCReview | split: "-" | last -%}

{% assign reviewRating_total = 0.0 -%}
{% assign reviewRating_length = 0 -%}
{% for reviewRating in reviews.items reversed-%}
	{% comment -%}Grouped Products{% endcomment %}
	{% if origID -%}
		{% if groupingList -%}
			{% if origID == reviewRating.reviewID -%}
				{% capture Rating_Bar -%} 
					{% include"/Layouts/WebApps/{{Review_Name}}/review_rating.tpl" -%} 
					{% include"/_System/apps/digifuel-review/public/reviews-schema.tpl" -%}
						{% capture newTot -%}{% if reviewRating.totreviews -%}{{reviewRating.totreviews | plus: 1}}{% endif %}{% endcapture %}
				{% endcapture %}
			{% endif %}
		{% endif %}
	{% comment -%}Product{% endcomment %}
	{% elseif id == reviewRating.reviewID -%}
	{% assign reviewRating_total = reviewRating_total | plus: reviewRating.Rating -%}
	{% assign reviewRating_length = reviewRating_length | plus: 1 -%}
		{% capture Rating_Bar -%} 
			{% include"/Layouts/WebApps/{{Review_Name}}/review_rating.tpl" -%} 
			{% include"/_System/apps/digifuel-review/public/reviews-schema.tpl" -%}
				{% capture newTot -%}{% if reviewRating.totreviews -%}{{reviewRating.totreviews | plus: 1}}{% endif %}{% endcapture %}
		{% endcapture %}
	{% comment -%}Webapp{% endcomment %}
	{% elseif itemid == reviewRating.reviewID -%}
	{% assign reviewRating_total = reviewRating_total | plus: reviewRating.Rating -%}
	{% assign reviewRating_length = reviewRating_length | plus: 1 -%}
		{% capture Rating_Bar -%} 
			{% include"/Layouts/WebApps/{{Review_Name}}/review_rating.tpl" -%} 
			{% include"/_System/apps/digifuel-review/public/reviews-schema.tpl" -%}
				{% capture newTot -%}{% if reviewRating.totreviews -%}{{reviewRating.totreviews | plus: 1}}{% endif %}{% endcapture %}
		{% endcapture %}
	{% comment -%}Page{% endcomment %}
	{% elseif globals.get.id == reviewRating.reviewID -%}
	{% assign reviewRating_total = reviewRating_total | plus: reviewRating.Rating -%}
	{% assign reviewRating_length = reviewRating_length | plus: 1 -%}
		{% capture Rating_Bar -%} 
			{% include"/Layouts/WebApps/{{Review_Name}}/review_rating.tpl" -%}
			{% include"/_System/apps/digifuel-review/public/reviews-schema.tpl" -%}
				{% capture newTot -%}{% if reviewRating.totreviews -%}{{reviewRating.totreviews | plus: 1}}{% endif %}{% endcapture %}
		{% endcapture %}
	{% endif %}
{% endfor %}
{% unless Rating_Bar -%}	
	{% capture Rating_Bar -%}<div class="ratingContainer"><p>Be the first to make a review.</p></div>{% endcapture %}
	{% capture newTot -%}1{% endcapture %} 
{% endunless %} 

{% assign reviewID = Review | split: "-" | last -%}
{module_json json="/_System/apps/digifuel-review/public/reviews_config/{{reviewID}}/review_options.json" template="" collection="review_options"}

{% assign reviews_offset = globals.get.reviewPage | convert: "number" | times: review_options.appSettings.reviewPagination | minus: review_options.appSettings.reviewPagination -%}
{% assign reviews_limit = review_options.appSettings.reviewPagination | convert: "number" -%}
{% assign reviews_offset_plus = reviews_offset | plus: reviews_limit -%}
{% unless reviews_offset -%}
	{% assign reviews_offset = 0 -%}
{% endunless %}
{% assign count = 0 -%}
{% capture Reviews_List -%}
	{% for reviewItem in reviews.items -%}
			{% if origID -%}
				{% if groupingList -%}
					{% if origID == reviewItem.reviewID -%}
                    	{% assign count = count | plus: 1 %}
                        {% if count > reviews_offset and count <= reviews_offset_plus -%}
                                {% include"/Layouts/WebApps/{{Review_Name}}/review_list.tpl" -%}
                        {% endif %}
					{% endif %}
				{% endif %}
			{% elseif id == reviewItem.reviewID -%}
                {% assign count = count | plus: 1 %}
				{% if count > reviews_offset and count <= reviews_offset_plus -%}
                 	{% include"/Layouts/WebApps/{{Review_Name}}/review_list.tpl" -%}
				{% endif %}
	    	{% elseif itemid == reviewItem.reviewID -%}
                {% assign count = count | plus: 1 %}
				{% if count > reviews_offset and count <= reviews_offset_plus -%}
                 	{% include"/Layouts/WebApps/{{Review_Name}}/review_list.tpl" -%}
				{% endif %}
	    	{% elseif globals.get.id == reviewItem.reviewID -%}
                {% assign count = count | plus: 1 %}
				{% if count > reviews_offset and count <= reviews_offset_plus -%}
                 	{% include"/Layouts/WebApps/{{Review_Name}}/review_list.tpl" -%}
				{% endif %}
	    	{% endif %} 
    {% endfor %}

    {% assign moduloCheck =  reviewRating_length | modulo :reviews_limit %}
	{% if moduloCheck == 0 %}
		{% assign totalPages = reviewRating_length | divided_by: reviews_limit | minus: 1 %}
	{% else %}
		{% assign totalPages = reviewRating_length | divided_by: reviews_limit %}
	{% endif %}
	{% if globals.get.reviewPage %}
		{% assign currentPage =  globals.get.reviewPage | convert: "number" | minus: 1 %}
	{% else %}
		{% assign currentPage = 0 %}
	{% endif %}
	{% assign minPage = currentPage | minus: 6 %}
	{% assign maxPage = currentPage | plus: 5 %}

	<div class="reviewFooter">
		{% for pageNum in (0..totalPages) %}
			{% if review_options.appSettings.reviewPagination != "" -%}
		       {% if pageNum == currentPage %}
		       		{% if forloop.length != 1 %}
			         {{ pageNum | plus: 1}}
			        {% endif %}
		       {% else %}
					{% if forloop.first %}
					<a href="{{globals.get.id}}?reviewPage={{currentPage}}&amp;reviewItems={{reviews_limit}}#reviews">prev</a>
					{% endif %}

					{% if forloop.length > 10 -%}
						{% if currentPage > 5 %}
							{% if pageNum > minPage and pageNum < maxPage ) %}
						<a href="{{globals.get.id}}?reviewPage={{ pageNum | plus: 1 }}&amp;reviewItems={{reviews_limit}}#reviews">{{ pageNum | plus: 1 }}</a>
							{% endif %}
						{% else %}
							{% if forloop.index < 11 %}
						<a href="{{globals.get.id}}?reviewPage={{ pageNum | plus: 1 }}&amp;reviewItems={{reviews_limit}}#reviews">{{ pageNum | plus: 1 }}</a>
							{% endif %}
						{% endif %}
					{% else %}  
					<a href="{{globals.get.id}}?reviewPage={{ pageNum | plus: 1 }}&amp;reviewItems={{reviews_limit}}#reviews">{{ pageNum | plus: 1 }}</a>
					{% endif %}

					{% if forloop.last %}
					<a href="{{globals.get.id}}?reviewPage={{currentPage | plus: 2}}&amp;reviewItems={{reviews_limit}}#reviews">next</a>
					{% endif %}
		       {% endif %}
		    {% endif %}
		{% endfor %}
	</div>
{% endcapture %}

{% capture Review_Form -%} {% include"/Layouts/WebApps/{{Review_Name}}/review_form.tpl" -%} {% endcapture %}
<link rel="stylesheet" type="text/css" href="/_System/apps/digifuel-review/public/reviews.css" />
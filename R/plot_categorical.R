#' Make a horizontal bar plot for a categorical survey variable
#'
#' @param .data a long-format summary dataset with the following columns: `question`, `var_label`, `prop`, `response`
#' @param question 
#' @param question_label 
#' @param include_annotation 
#' @param hovertext_template 
#' @param cateogry_label_ypos 
#'
#' @return
#' @export
#'
#' @examples
plot_categorical <- function(.data, question, question_label = NULL,
                             include_annotation = TRUE,
                             hovertext_template = NULL,
                             cateogry_label_ypos = 1) {
  
  if(!is.null(hovertext_template)) {
    hovertext_template <- hovertext_template %>% 
      str_wrap_hovertemplate(20) %>%
      paste0("<extra></extra>")
  }
  
  filtered_data <- .data %>% filter(question == {{question}})
  
  if(is.null(question_label)) question_label <- filtered_data %>% pull(var_label) %>% head(1) 
  
  # Wrap the question label
  question_label <- question_label %>% str_wrap(20)
  
  # Number of categories for the palette
  num_categories <- filtered_data %>%
    nrow()
  colors <- wrk_pal()(num_categories)
  
  plot_ly() %>%
    add_bars(data = filtered_data,
             y = question_label,
             x = ~prop,
             meta = ~response %>% str_to_lower(),
             group = ~response,
             text = ~sprintf("%.1f%%", prop * 100),
             insidetextanchor = "middle",
             textfont = list(color = "white"),
             textposition = "inside",
             width = 0.5,
             hovertemplate = hovertext_template,
             textangle = 0,
             # Use WRK color 
             marker = list(color = colors,
                           line = list(color = "#d9d9d9",
                                       width = 1))) %>%
    {if(include_annotation){
      add_annotations(., data = filtered_data,
                      text = ~response %>% str_wrap(5),
                      x = ~prop_cumsum,
                      y = cateogry_label_ypos,
                      showarrow = FALSE,
                      yref = "paper")
    } else .} %>% 
    layout(barmode = "stack") %>%
    hide_guides() %>%
    plotly_remove_axis_titles() %>%
    layout(xaxis = list(showgrid = FALSE, showticklabels = FALSE,
                        zeroline = FALSE),
           yaxis = list(showgrid = FALSE)) %>%
    layout(margin = list(pad = 20)) %>%
    hide_guides() %>%
    plotly_disable_zoom() %>%
    plotly_hide_modebar()
  
}


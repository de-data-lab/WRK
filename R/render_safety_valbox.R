#' Render the value box for the safety tab
#'
#' @param .data 
#'
#' @return
#' @export
#'
#' @examples
render_safety_valbox <- function(.data, question = "feel_safe_day",
                                 caption = "survey participants reported feeling safe while walking during the day time",
                                 icon = "fa-shield",
                                 color = "primary") {
  safety_valbox_df <- .data %>%
    ungroup() %>%
    filter(question == {{question}}) %>%
    select(response, prop) %>%
    pivot_wider(names_from = response,
                values_from = prop) %>%
    mutate(feeling_safe = `Somewhat safe` + `Very safe`,
           feeling_unsafe = `Very unsafe` + `Somewhat unsafe`) %>%
    mutate(across(c(feeling_safe, feeling_unsafe),
                  list("txt" = ~sprintf("%.1f%%", .  * 100))))
  
  # Render valbox
  safety_valbox_df %>%
    pull(feeling_safe_txt) %>%
    valueBox(caption = caption,
             icon = icon,
             color = color)

}
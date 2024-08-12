using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using SnakeApp.Contracts;
using SnakeApp.Model;

namespace SnakeApp.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public readonly GamemodeOptions Gamemodes;

        [BindProperty]
        public AddScoreRequest? Score {  get; set; }
        
        public IndexModel(ILogger<IndexModel> logger, IOptionsSnapshot<GamemodeOptions> gamemodeOptions)
        {
            _logger = logger;
            Gamemodes = gamemodeOptions.Value;
        }
    }
}

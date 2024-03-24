using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using SnakeApp.Model;

namespace SnakeApp.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public readonly GamemodeOptions Gamemodes;
        
        public IndexModel(ILogger<IndexModel> logger, IOptionsSnapshot<GamemodeOptions> gamemodeOptions)
        {
            _logger = logger;
            Gamemodes = gamemodeOptions.Value;
        }

        public void OnGet()
        {

        }
    }
}

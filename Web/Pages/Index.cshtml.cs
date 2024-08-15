using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using SnakeApp.Model;
using SnakeGame.Infrastructure;
using SnakeGame.Infrastructure.Entities;

namespace SnakeApp.Pages
{
    public class IndexModel : PageModel
    {
        readonly ILogger<IndexModel> _logger;

        public readonly GamemodeOptions Gamemodes;

        public IndexModel(ILogger<IndexModel> logger, IOptionsSnapshot<GamemodeOptions> gamemodeOptions)
        {
            _logger = logger;
            Gamemodes = gamemodeOptions.Value;
        }
    }
}

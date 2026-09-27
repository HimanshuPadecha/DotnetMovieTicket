namespace Ticket_Management_System.Models;

public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Genre { get; set; } = null!;
    public string Language { get; set; } = null!;
    public int DurationMinutes { get; set; }
    public string Rating { get; set; } = "U/A";
    public string Description { get; set; } = null!;
    public DateTime ReleaseDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? BackdropUrl { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Show> Shows { get; set; } = new List<Show>();
}
